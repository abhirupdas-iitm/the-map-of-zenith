// ================== FIRESTORE DATABASE LAYER ==================
// Replaces localStorage with Firestore for persistent daily log storage.
// localStorage is kept as a write-through cache for offline resilience.

(function () {

  // ---- Init Firebase ----
  firebase.initializeApp(FIREBASE_CONFIG);
  const firestore = firebase.firestore();

  // Firestore document path for daily logs
  const LOGS_DOC_REF = firestore.collection("dailyLogs").doc("admin");

  // ---- Load logs from Firestore (with localStorage fallback) ----
  async function loadLogsFromFirestore() {

    try {

      const snap = await LOGS_DOC_REF.get();

      if (snap.exists) {

        const firestoreLogs = snap.data();

        // Also check localStorage for any entries not yet in Firestore (migration)
        const localRaw = localStorage.getItem("dailyLogs");
        const localLogs = localRaw ? JSON.parse(localRaw) : {};

        const localKeys = Object.keys(localLogs);
        const firestoreKeys = Object.keys(firestoreLogs);

        let needsMerge = false;

        for (const key of localKeys) {
          if (!firestoreLogs[key]) {
            firestoreLogs[key] = localLogs[key];
            needsMerge = true;
          }
        }

        if (needsMerge) {
          await LOGS_DOC_REF.set(firestoreLogs);
          console.log("[db] Merged localStorage entries into Firestore.");
        }

        // Sync localStorage cache
        localStorage.setItem("dailyLogs", JSON.stringify(firestoreLogs));

        return firestoreLogs;

      } else {

        // Firestore doc doesn't exist yet — migrate from localStorage
        const localRaw = localStorage.getItem("dailyLogs");
        const localLogs = localRaw ? JSON.parse(localRaw) : {};

        if (Object.keys(localLogs).length > 0) {
          await LOGS_DOC_REF.set(localLogs);
          console.log("[db] Migrated localStorage data to Firestore.");
        }

        return localLogs;
      }

    } catch (err) {

      console.warn("[db] Firestore read failed, falling back to localStorage:", err);

      const localRaw = localStorage.getItem("dailyLogs");
      return localRaw ? JSON.parse(localRaw) : {};
    }
  }


  // ---- Save logs to both Firestore and localStorage ----
  async function saveLogsToFirestore(logs) {

    // Write-through: always update localStorage immediately for responsiveness
    localStorage.setItem("dailyLogs", JSON.stringify(logs));

    try {

      await LOGS_DOC_REF.set(logs);
      console.log("[db] Saved to Firestore.");

    } catch (err) {

      console.warn("[db] Firestore write failed (data is in localStorage):", err);
    }
  }


  // ---- Expose globally ----
  window.db = {
    loadLogs: loadLogsFromFirestore,
    saveLogs: saveLogsToFirestore
  };

})();

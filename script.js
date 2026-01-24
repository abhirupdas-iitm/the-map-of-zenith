// ================== CONFIG ==================
const START_DATE = new Date("2025-12-27T00:00:00");
const TOTAL_WEEKS = 52;
const TOTAL_DAYS = 365;

// ================== ELEMENTS ==================
const toggleBtn = document.getElementById("toggleProgress");
const progressSection = document.getElementById("progressSection");
const weeksGrid = document.querySelector(".weeks-grid");

const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const openLogsBtn = document.getElementById("openLogs");

let activeWeek = null;

// ================== DAILY LOGS ==================
function loadLogs() {
  const logs = localStorage.getItem("dailyLogs");
  return logs ? JSON.parse(logs) : {};
}

function saveLogs(logs) {
  localStorage.setItem("dailyLogs", JSON.stringify(logs));
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function previousDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}


const dailyLogs = loadLogs();

// Allow log entry ONLY for today
if (!dailyLogs[todayKey()]) {
  const entry = prompt("Write today's log (cannot be changed later):");

  if (entry && entry.trim()) {
    dailyLogs[todayKey()] = entry.trim();
    saveLogs(dailyLogs);
  }
}

function calculateCurrentStreak(logs) {
  let streak = 0;
  let day = todayKey();

  while (logs[day]) {
    streak++;
    day = previousDay(day);
  }

  return streak;
}

function calculateLongestStreak(logs) {
  const dates = Object.keys(logs).sort(); // oldest → newest
  let longest = 0;
  let current = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      current = 1;
    } else {
      const expected = previousDay(dates[i]);
      if (dates[i - 1] === expected) {
        current++;
      } else {
        current = 1;
      }
    }
    longest = Math.max(longest, current);
  }

  return longest;
}



// ================== MODAL ==================
function closeModal() {
  backdrop.classList.remove("active");
  modal.classList.remove("active");

  setTimeout(() => {
    backdrop.classList.add("hidden");
    modal.classList.add("hidden");
    modalContent.innerHTML = "";
    activeWeek = null;
  }, 200);
}

backdrop.addEventListener("click", closeModal);

// ================== GATE TIMER MODAL ==================
const openGateTimerBtn = document.getElementById("openGateTimer");

if (openGateTimerBtn) {
  openGateTimerBtn.addEventListener("click", () => {
    modalContent.innerHTML = `
      <div class="gate-timer">
        <img src="rabbit-clock.png" alt="Time waits">
        <div class="timer-box" id="gateTimerBox">--:--:--</div>
      </div>
    `;

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

    // Sync timer display
    const box = document.getElementById("gateTimerBox");
    if (box) box.textContent = latestTimeString;
  });
}

// ================== LOGS MODAL ==================
if (openLogsBtn) {
  openLogsBtn.addEventListener("click", () => {
    modalContent.innerHTML = "<h3>Daily Logs</h3>";

    const ul = document.createElement("ul");
    ul.className = "logs-list";

    const keys = Object.keys(dailyLogs).sort().reverse();

    if (keys.length === 0) {
      ul.innerHTML = "<li>No logs yet.</li>";
    }

    keys.forEach(date => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="log-date">${date}</span>
        <span class="log-preview">${dailyLogs[date].slice(0, 60)}...</span>
      `;

      li.addEventListener("click", () => {
        modalContent.innerHTML = `
          <h3>${date}</h3>
          <pre>${dailyLogs[date]}</pre>
        `;
      });

      ul.appendChild(li);
    });

    modalContent.appendChild(ul);

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });
  });
}

// ================== TOGGLE ==================
toggleBtn.addEventListener("click", () => {
  progressSection.classList.toggle("hidden");
});

// ================== LOCAL STORAGE (WEEKS) ==================
function loadCompletedWeeks() {
  const stored = localStorage.getItem("completedWeeks");
  return stored ? JSON.parse(stored) : [];
}

function saveCompletedWeeks(arr) {
  localStorage.setItem("completedWeeks", JSON.stringify(arr));
}

let storedCompletedWeeks = loadCompletedWeeks();

// ================== YEAR PROGRESS ==================
const today = new Date();
const daysPassed = Math.floor(
  (today - START_DATE) / (1000 * 60 * 60 * 24)
);

const progress = Math.min(daysPassed / TOTAL_DAYS, 1);
document.querySelector(".progress-fill").style.width =
  `${progress * 100}%`;

// ================== COMPLETED WEEKS CONTENT ==================
const completedWeeks = {
  1: `
    <strong>Week 1 (Dec 27 – Jan 2)</strong>
    <ul class="week-list">
      <li>Maths: Discrete Math (Sets, Logic, Relations)</li>
      <li>DSA: Arrays, Stacks, Queues</li>
      <li>DBMS: ER Model, Relational Model</li>
      <li>PYQs: Discrete + Arrays</li>
      <li>Admin: IITM term orientation</li>
    </ul>
  `,
  2: `
    <strong>Week 2 (Jan 3 – Jan 9)</strong>
    <ul class="week-list">
      <li>Maths: Functions, Graph basics</li>
      <li>DSA: Linked Lists</li>
      <li>DBMS: Relational Algebra</li>
      <li>PYQs: Discrete full + LL</li>
      <li>IITM: Lectures + Assignment batch</li>
    </ul>
  `,
  3: `
    <strong>Week 3 (Jan 10 – Jan 16)</strong>
    <ul class="week-list">
      <li>Maths: Linear Algebra (Vector spaces, Rank)</li>
      <li>DSA: Trees (BST, Traversal)</li>
      <li>DBMS: SQL Basics</li>
      <li>PYQs: LA + Trees</li>
    </ul>
  `,
  4: `
    <strong>Week 4 (Jan 17 - Jan 23)</strong>
    <ul class="week-list">
      <li>Maths: Eigenvalues, SVD (Singular Value Decomposition)</li>
      <li>DSA: Hashing</li>
      <li>DBMS: SQL joins, subqueries</li>
      <li>PYQs: LA (Linear Algebra) + Hashing
  `
};

// ================== HELPERS ==================
function weekEndDate(week) {
  return new Date(
    START_DATE.getTime() + week * 7 * 24 * 60 * 60 * 1000
  );
}

// ================== GENERATE WEEKS ==================
const now = new Date();

for (let i = 1; i <= TOTAL_WEEKS; i++) {
  const week = document.createElement("div");
  week.textContent = `W${i}`;
  week.classList.add("week");

  const end = weekEndDate(i);

  if (now > end) {
    week.classList.add("completed");

    if (storedCompletedWeeks.includes(i)) {
      week.classList.add("completed");
    }

    week.addEventListener("click", () => {
      if (!storedCompletedWeeks.includes(i)) {
        storedCompletedWeeks.push(i);
        saveCompletedWeeks(storedCompletedWeeks);
      }

      modalContent.innerHTML =
        completedWeeks[i] || "<p>No data for this week.</p>";

      backdrop.classList.remove("hidden");
      modal.classList.remove("hidden");

      requestAnimationFrame(() => {
        backdrop.classList.add("active");
        modal.classList.add("active");
      });

      activeWeek = i;
    });
  } else {
    week.classList.add("locked");
  }

  weeksGrid.appendChild(week);
}

// ================== COUNTDOWN ==================
const targetDate = new Date("2027-02-06T00:00:00").getTime();


const currentStreak = calculateCurrentStreak(dailyLogs);
const longestStreak = calculateLongestStreak(dailyLogs);

console.log("Current streak:", currentStreak);
console.log("Longest streak:", longestStreak);

// ================== STREAK UI BINDING ==================
const streakEl = document.getElementById("currentStreak");
const bestEl = document.getElementById("bestStreak");
const streakFill = document.getElementById("streakFill");

// Compute streaks
function computeStreaks(logs) {
  const dates = Object.keys(logs).sort();
  let current = 0;
  let best = 0;

  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      current = 1;
    } else {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff =
        (curr - prev) / (1000 * 60 * 60 * 24);

      if (diff === 1) current++;
      else current = 1;
    }
    best = Math.max(best, current);
  }

  return { current, best };
}

// Render streak
const { current, best } = computeStreaks(dailyLogs);

streakEl.textContent = current;
bestEl.textContent = best;

// Cap visual bar at 30 days for aesthetics
const capped = Math.min(current, 30);
streakFill.style.width = `${(capped / 30) * 100}%`;

// ================== SINGLE GLOBAL TIMER ==================
const targetDate = new Date("2027-02-06T00:00:00").getTime();
let latestTimeString = "";

setInterval(() => {
  const now = Date.now();
  const diff = targetDate - now;

  if (diff <= 0) {
    latestTimeString = "00:00:00";
    return;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  latestTimeString =
    `${hours.toString().padStart(2, "0")}:` +
    `${minutes.toString().padStart(2, "0")}:` +
    `${seconds.toString().padStart(2, "0")}`;
}, 1000);

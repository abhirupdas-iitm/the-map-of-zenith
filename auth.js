document.addEventListener("DOMContentLoaded", function () {

  const auth = firebase.auth();

  const authScreen = document.getElementById("authScreen");
  const loginBtn = document.getElementById("loginBtn");
  const guestBtn = document.getElementById("guestBtn");
  const forgotLink = document.getElementById("forgotPasswordLink");
  const authError = document.getElementById("authError");
  const authSuccess = document.getElementById("authSuccess");
  const sessionControls = document.getElementById("sessionControls");

  // ================== ROLE HELPERS ==================

  function setRole(role) {
    sessionStorage.setItem("zenith_role", role);
  }

  function getRole() {
    return sessionStorage.getItem("zenith_role");
  }

  function clearRole() {
    sessionStorage.removeItem("zenith_role");
  }

  // ================== AUTH SCREEN ==================

  function showAuth() {
    if (authScreen) {
      document.body.prepend(authScreen);
      authScreen.style.display = "flex";
    }
  }

  function hideAuth() {
    if (authScreen) authScreen.remove();
  }

  function clearMessages() {
    if (authError) authError.textContent = "";
    if (authSuccess) {
      authSuccess.textContent = "";
      authSuccess.classList.add("hidden");
    }
  }

  function showError(msg) {
    clearMessages();
    if (authError) authError.textContent = msg;
  }

  function showSuccess(msg) {
    clearMessages();
    if (authSuccess) {
      authSuccess.textContent = msg;
      authSuccess.classList.remove("hidden");
    }
  }

  // ================== SESSION CONTROLS ==================

  function renderSessionControls() {

    sessionControls.innerHTML = "";

    const role = getRole();

    if (role === "guest") {

      const loginAgain = document.createElement("button");
      loginAgain.textContent = "Login";
      loginAgain.className = "progress-btn";
      loginAgain.onclick = () => {
        clearRole();
        showAuth();
      };

      sessionControls.appendChild(loginAgain);

    } else if (role === "admin") {

      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      logoutBtn.className = "progress-btn";
      logoutBtn.onclick = () => {
        auth.signOut().then(() => {
          clearRole();
          showAuth();
          location.reload();
        });
      };

      sessionControls.appendChild(logoutBtn);

    }

  }

  // ================== APPLY ROLE ==================

  function applyRole() {

    const role = getRole();

    if (!role) {
      showAuth();
      return;
    }

    hideAuth();
    renderSessionControls();

    const submitBtn = document.getElementById("submitDailyLog");

    if (submitBtn) {
      if (role === "guest") {
        submitBtn.style.display = "none";
      } else {
        submitBtn.style.display = "inline-block";
      }
    }

  }

  // ================== LOGIN (FIREBASE AUTH) ==================

  if (loginBtn) {
    loginBtn.onclick = function () {

      clearMessages();

      const email = document.getElementById("adminEmail").value.trim();
      const password = document.getElementById("adminPassword").value;

      if (!email) {
        showError("Please enter your email.");
        return;
      }

      if (!password) {
        showError("Please enter your password.");
        return;
      }

      loginBtn.disabled = true;
      loginBtn.textContent = "Signing in...";

      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          setRole("admin");
          applyRole();
          loginBtn.disabled = false;
          loginBtn.textContent = "Login";
        })
        .catch((err) => {
          loginBtn.disabled = false;
          loginBtn.textContent = "Login";

          // User-friendly error messages
          switch (err.code) {
            case "auth/user-not-found":
              showError("No account found with this email.");
              break;
            case "auth/wrong-password":
              showError("Incorrect password.");
              break;
            case "auth/invalid-email":
              showError("Invalid email format.");
              break;
            case "auth/invalid-credential":
              showError("Invalid email or password.");
              break;
            case "auth/too-many-requests":
              showError("Too many attempts. Try again later.");
              break;
            default:
              showError("Login failed. Please try again.");
          }
        });

    };
  }

  // ================== GUEST LOGIN ==================

  if (guestBtn) {
    guestBtn.onclick = function () {
      setRole("guest");
      applyRole();
    };
  }

  // ================== FORGOT PASSWORD ==================

  if (forgotLink) {
    forgotLink.onclick = function (e) {
      e.preventDefault();
      clearMessages();

      const email = document.getElementById("adminEmail").value.trim();

      if (!email) {
        showError("Enter your email above, then click Forgot Password.");
        return;
      }

      forgotLink.textContent = "Sending...";
      forgotLink.style.pointerEvents = "none";

      auth.sendPasswordResetEmail(email)
        .then(() => {
          showSuccess(
            "Password reset link has been sent to the admin's registered email address."
          );
          forgotLink.textContent = "Forgot Password?";
          forgotLink.style.pointerEvents = "";
        })
        .catch((err) => {
          forgotLink.textContent = "Forgot Password?";
          forgotLink.style.pointerEvents = "";

          if (err.code === "auth/user-not-found") {
            showError("No account found with this email.");
          } else if (err.code === "auth/invalid-email") {
            showError("Invalid email format.");
          } else {
            showError("Could not send reset email. Try again.");
          }
        });

    };
  }

  // ================== PERSISTENT AUTH STATE ==================
  // If Firebase Auth has a persisted session, auto-login as admin

  auth.onAuthStateChanged((user) => {
    if (user) {
      // Firebase user is signed in
      if (!getRole()) {
        setRole("admin");
      }
      applyRole();
    } else {
      // No Firebase user — check for guest session
      applyRole();
    }
  });

});

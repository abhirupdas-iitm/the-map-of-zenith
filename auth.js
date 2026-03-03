document.addEventListener("DOMContentLoaded", function () {

  const ADMIN_PASSWORD = "your-new-password-here";

  const authScreen = document.getElementById("authScreen");
  const loginBtn = document.getElementById("loginBtn");
  const guestBtn = document.getElementById("guestBtn");
  const authError = document.getElementById("authError");
  const sessionControls = document.getElementById("sessionControls");

  function setRole(role) {
    sessionStorage.setItem("zenith_role", role);
  }

  function getRole() {
    return sessionStorage.getItem("zenith_role");
  }

  function clearRole() {
    sessionStorage.removeItem("zenith_role");
  }

  function showAuth() {
    if (authScreen) {
      document.body.prepend(authScreen);
      authScreen.style.display = "flex";
    }
  }

  function hideAuth() {
    if (authScreen) authScreen.remove();
  }

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
        clearRole();
        showAuth();
        location.reload();
      };

      sessionControls.appendChild(logoutBtn);

    }

  }

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

  if (loginBtn) {
    loginBtn.onclick = function () {
      const input = document.getElementById("adminPassword").value;

      if (input === ADMIN_PASSWORD) {
        setRole("admin");
        applyRole();
      } else {
        authError.textContent = "Incorrect password.";
      }
    };
  }

  if (guestBtn) {
    guestBtn.onclick = function () {
      setRole("guest");
      applyRole();
    };
  }

  applyRole();

});

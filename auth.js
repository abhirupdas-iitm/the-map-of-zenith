document.addEventListener("DOMContentLoaded", function () {

  const ADMIN_PASSWORD = "your-new-password-here";

  const authScreen = document.getElementById("authScreen");
  const loginBtn = document.getElementById("loginBtn");
  const guestBtn = document.getElementById("guestBtn");
  const authError = document.getElementById("authError");

  function setRole(role) {
    sessionStorage.setItem("zenith_role", role);
  }

  function getRole() {
    return sessionStorage.getItem("zenith_role");
  }

  function hideAuth() {
    if (authScreen) authScreen.remove();
  }

  function applyRole() {
    const role = getRole();
    if (!role) return;

    hideAuth();

    if (role === "guest") {
      const submitBtn = document.getElementById("submitDailyLog");
      if (submitBtn) submitBtn.style.display = "none";
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

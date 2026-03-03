// ================== AUTH SYSTEM ==================

const ADMIN_PASSWORD = "IamAbhirupDas"; // change this

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
  authScreen.remove();
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

// ================== ELEMENTS ==================
const toggleBtn = document.getElementById("toggleProgress");
const progressSection = document.getElementById("progressSection");
const weeksGrid = document.querySelector(".weeks-grid");
const detailsBox = document.getElementById("weekDetails");
let activeWeek = null;

// ===== MODAL ELEMENTS (ADD THESE RIGHT HERE) =====
const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
backdrop.addEventListener("click", closeModal);

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

// ================== TOGGLE ==================
toggleBtn.addEventListener("click", () => {
  progressSection.classList.toggle("hidden");
});

// ================== CONFIG ==================
const PLAN_START = new Date("2025-12-27T00:00:00");
const TOTAL_WEEKS = 52;

// ================== LOCAL STORAGE HELPERS ==================
function loadCompletedWeeks() {
  const stored = localStorage.getItem("completedWeeks");
  return stored ? JSON.parse(stored) : [];
}

function saveCompletedWeeks(weeksArray) {
  localStorage.setItem(
    "completedWeeks",
    JSON.stringify(weeksArray)
  );
}


// ================== YEAR PROGRESS (365 DAYS) ==================
const START_DATE = new Date("2025-12-27T00:00:00");
const TOTAL_DAYS = 365;

const today = new Date();
const daysPassed = Math.floor(
  (today - START_DATE) / (1000 * 60 * 60 * 24)
);

const progress = Math.min(daysPassed / TOTAL_DAYS, 1);

document.querySelector(".progress-fill").style.width =
  `${progress * 100}%`;

// ================== COMPLETED WEEKS (EDIT THIS ONLY) ==================
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
  `
};


// ================== HELPERS ==================
function weekEndDate(week) {
  return new Date(PLAN_START.getTime() + week * 7 * 24 * 60 * 60 * 1000);
}

// ================== GENERATE WEEKS ==================
let storedCompletedWeeks = loadCompletedWeeks();
const now = new Date();

for (let i = 1; i <= TOTAL_WEEKS; i++) {
  const week = document.createElement("div");
  week.textContent = `W${i}`;

  // BASE CLASS — DO NOT REMOVE
  week.classList.add("week");

  const end = weekEndDate(i);

  if (now > end && completedWeeks[i]) {
    // COMPLETED
    week.classList.add("completed");

  week.addEventListener("click", () => {
    modalContent.innerHTML = completedWeeks[i];
      // ENFORCEMENT OF STEP  (THIS IS THE LINE YOU ASKED ABOUT)
    if (now > end && !storedCompletedWeeks.includes(i)) {
      storedCompletedWeeks.push(i);
      saveCompletedWeeks(storedCompletedWeeks);
    }
    backdrop.classList.remove("hidden");
      modal.classList.remove("hidden");

    // allow animation frame so CSS transition works
    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

    activeWeek = i;
  });


  } else {
    // FUTURE / LOCKED
    week.classList.add("locked");
  }

  weeksGrid.appendChild(week);
}


// ================== COUNTDOWN ==================
const targetDate = new Date("2027-02-06T00:00:00").getTime();
const timer = document.getElementById("timer");

setInterval(() => {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    timer.textContent = "It begins.";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  timer.textContent = `${days} days • ${hours} hours • ${minutes} minutes`;
}, 1000);

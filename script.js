// ================== ELEMENTS ==================
const toggleBtn = document.getElementById("toggleProgress");
const progressSection = document.getElementById("progressSection");
const weeksGrid = document.querySelector(".weeks-grid");
const detailsBox = document.getElementById("weekDetails");
let activeWeek = null;

// ================== TOGGLE ==================
toggleBtn.addEventListener("click", () => {
  progressSection.classList.toggle("hidden");
});

// ================== CONFIG ==================
const PLAN_START = new Date("2025-12-27T00:00:00");
const TOTAL_WEEKS = 52;

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
    if (activeWeek === i) {
      // HIDE
      detailsBox.classList.remove("active");
      document.getElementById("backdrop").classList.remove("active");
  
      setTimeout(() => {
        detailsBox.classList.add("hidden");
        detailsBox.innerHTML = "";
      }, 200);
  
      activeWeek = null;
    } else {
      // SHOW
      detailsBox.innerHTML = completedWeeks[i];
      detailsBox.classList.remove("hidden");
      detailsBox.classList.add("active");
      document.getElementById("backdrop").classList.add("active");
  
      activeWeek = i;
    }
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

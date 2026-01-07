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

let activeWeek = null;

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

// ================== TOGGLE ==================
toggleBtn.addEventListener("click", () => {
  progressSection.classList.toggle("hidden");
});

// ================== LOCAL STORAGE ==================
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
const timer = document.getElementById("timer");

setInterval(() => {
  const now = Date.now();
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

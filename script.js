const toggleBtn = document.getElementById("toggleProgress");
const progressSection = document.getElementById("progressSection");
const weeksGrid = document.querySelector(".weeks-grid");
const detailsBox = document.getElementById("weekDetails");

toggleBtn.addEventListener("click", () => {
  progressSection.classList.toggle("hidden");
});

// ===== CONFIG =====
const PLAN_START = new Date("2025-12-27T00:00:00");
const TOTAL_WEEKS = 52;

// ===== YOUR ACTUAL COMPLETIONS (EDIT THIS ONLY) =====
const completedWeeks = {
  1: `
Week 1 — Dec 27 to Jan 2

• Discrete Math: Sets, Logic, Relations
• DSA: Arrays, Stacks, Queues
• DBMS: ER & Relational Model
• PYQs solved
• IITM orientation done
`
  // add more weeks as you complete them
};

// ===== HELPERS =====
function weekEndDate(week) {
  return new Date(PLAN_START.getTime() + week * 7 * 24 * 60 * 60 * 1000);
}

const now = new Date();

// ===== GENERATE WEEKS =====
for (let i = 1; i <= TOTAL_WEEKS; i++) {
  const week = document.createElement("div");
  week.textContent = `W${i}`;

  const end = weekEndDate(i);

  if (now > end && completedWeeks[i]) {
    // COMPLETED
    week.className = "week completed";
    week.addEventListener("click", () => {
      detailsBox.innerText = completedWeeks[i];
      detailsBox.classList.remove("hidden");
    });
  } else {
    // FUTURE or INCOMPLETE
    week.className = "week locked";
  }

  weeksGrid.appendChild(week);
}
// ===== COUNTDOWN =====
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

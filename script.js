// ================== CONFIG ==================
const START_DATE = new Date("2026-02-01T00:00:00");
const TOTAL_WEEKS = 52;
const TOTAL_DAYS = 365;

// baseline hours for scoring
const BASELINE_HOURS = 11;

// ✅ SINGLE authoritative target date
const targetDate = new Date("2027-02-01T00:00:00").getTime();

// ================== ELEMENTS ==================
const toggleBtn = document.getElementById("toggleProgress");
const progressSection = document.getElementById("progressSection");
const weeksGrid = document.querySelector(".weeks-grid");

const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

const openLogsBtn = document.getElementById("openLogs");

// NEW BUTTON
const submitDailyLogBtn = document.getElementById("submitDailyLog");

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
  const now = new Date();
  return `${now.getFullYear()}-${
    String(now.getMonth() + 1).padStart(2, "0")
  }-${
    String(now.getDate()).padStart(2, "0")
  }`;
}

function previousDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);

  return `${d.getFullYear()}-${
    String(d.getMonth() + 1).padStart(2, "0")
  }-${
    String(d.getDate()).padStart(2, "0")
  }`;
}

const dailyLogs = loadLogs();

// ================== PERFORMANCE SCORE ==================
function computePerformanceScore(hours, tasks, adherence) {

  const hoursScore =
    Math.min(hours / BASELINE_HOURS, 1) * 4;

  const tasksScore =
    Math.min(tasks / 5, 1) * 3;

  const adherenceScore =
    (adherence / 10) * 3;

  return +(hoursScore + tasksScore + adherenceScore)
    .toFixed(2);
}

// ================== FALLBACK PROMPT ==================
if (!dailyLogs[todayKey()]) {

  const entry =
    prompt("Write today's log (cannot be changed later):");

  if (entry && entry.trim()) {

    dailyLogs[todayKey()] = entry.trim();

    saveLogs(dailyLogs);
  }
}

// ================== MODAL ==================
function closeModal() {

  stopGateTimerLive();

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

// ================== DAILY LOG FORM ==================
if (submitDailyLogBtn) {

  submitDailyLogBtn.addEventListener("click", () => {

    const key = todayKey();

    if (dailyLogs[key]) {

      modalContent.innerHTML = `
        <h3>Log already submitted</h3>
        <p>Daily logs are immutable.</p>
      `;
    }

    else {

      modalContent.innerHTML = `
        <h3>Submit Daily Log</h3>

        <label>Hours studied</label>
        <input id="hoursInput" type="number" min="0">

        <label>Tasks completed</label>
        <input id="tasksInput" type="number" min="0">

        <label>Plan adherence (1–10)</label>
        <input id="adherenceInput" type="range" min="1" max="10" value="5">

        <label>Reflection</label>
        <textarea id="reflectionInput"></textarea>

        <button id="submitLogBtn" class="progress-btn">
          Submit
        </button>
      `;

      document
      .getElementById("submitLogBtn")
      .addEventListener("click", () => {

        const hours =
          Number(document.getElementById("hoursInput").value) || 0;

        const tasks =
          Number(document.getElementById("tasksInput").value) || 0;

        const adherence =
          Number(document.getElementById("adherenceInput").value) || 0;

        const reflection =
          document.getElementById("reflectionInput").value || "";

        const score =
          computePerformanceScore(
            hours,
            tasks,
            adherence
          );

        dailyLogs[key] = {

          hours,
          tasks,
          adherence,
          reflection,
          performanceScore: score,
          timestamp: Date.now()

        };

        saveLogs(dailyLogs);

        closeModal();

        location.reload();
      });
    }

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    requestAnimationFrame(() => {

      backdrop.classList.add("active");
      modal.classList.add("active");

    });

  });
}

// ================== GATE TIMER MODAL ==================
const openGateTimerBtn =
  document.getElementById("openGateTimer");

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

    const box =
      document.getElementById("gateTimerBox");

    if (box)
      box.textContent = latestTimeString;

    startGateTimerLive();
  });
}

// ================== LOGS MODAL ==================
if (openLogsBtn) {

  openLogsBtn.addEventListener("click", () => {

    modalContent.innerHTML =
      "<h3>Daily Logs</h3>";

    const ul =
      document.createElement("ul");

    ul.className =
      "logs-list";

    const keys =
      Object.keys(dailyLogs)
      .sort()
      .reverse();

    if (keys.length === 0)
      ul.innerHTML =
        "<li>No logs yet.</li>";

    keys.forEach(date => {

      const li =
        document.createElement("li");

      const entry =
        dailyLogs[date];

      const text =
        typeof entry === "string"
        ? entry
        : entry.reflection;

      li.innerHTML = `
        <span class="log-date">${date}</span>
        <span class="log-preview">
        ${text.slice(0,60)}...
        </span>
      `;

      li.addEventListener("click", () => {

        modalContent.innerHTML = `
          <h3>${date}</h3>
          <pre>${text}</pre>
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

  progressSection.classList
  .toggle("hidden");

});

// ================== LOCAL STORAGE (WEEKS) ==================
function loadCompletedWeeks() {

  const stored =
    localStorage.getItem("completedWeeks");

  return stored
    ? JSON.parse(stored)
    : [];
}

function saveCompletedWeeks(arr) {

  localStorage.setItem(
    "completedWeeks",
    JSON.stringify(arr)
  );
}

let storedCompletedWeeks =
  loadCompletedWeeks();

// ================== YEAR PROGRESS ==================
const today = new Date();

const daysPassed =
  Math.floor(
    (today - START_DATE)
    / (1000 * 60 * 60 * 24)
  );

const progress =
  Math.min(
    Math.max(daysPassed / TOTAL_DAYS, 0),
    1
  );

document
.querySelector(".progress-fill")
.style.width =
`${progress * 100}%`;

// ================== COMPLETED WEEKS CONTENT ================== 
const completedWeeks = {
  1:
   <strong>Week 1 (Feb 1 – Feb 7)</strong> 
   <ul class="week-list"> 
   <li>Maths: Discrete Math (Sets, Logic, Relations)</li> 
   <li>DSA: Arrays, Stacks, Queues</li> 
   <li>DBMS: ER Model, Relational Model</li> 
   <li>PYQs: Discrete + Arrays</li> 
   <li>Admin: IITM term settling</li> 
   </ul> , 
  2: 
   <strong>Week 2 (Feb 8 – Feb 14)</strong> 
   <ul class="week-list"> 
   <li>Maths: Functions, Graph Basics</li> 
   <li>DSA: Linked Lists</li> 
   <li>DBMS: Relational Algebra</li> 
   <li>PYQs: Discrete full + LL</li> 
   </ul> , 
  3: 
   <strong>Week 3 (Feb 15 – Feb 21)</strong> 
   <ul class="week-list"> 
   <li>Maths: Linear Alegbra (Vector Spaces and Rank)</li> 
   <li>DSA: Trees (BSTs, Traversals)</li> 
   <li>DBMS: SQL Basics</li> 
   <li>PYQs: LA + Trees</li> 
   <li>IITM Quiz-1 proximity → reducing PYQs volume, not theory</li> 
   </ul> 
};

// ================== HELPERS ==================
function weekEndDate(week) {

  return new Date(
    START_DATE.getTime()
    + week * 7 * 86400000
  );
}

// ================== GENERATE WEEKS ==================
const now = new Date();

for (let i=1;i<=TOTAL_WEEKS;i++){

  const week =
    document.createElement("div");

  week.textContent = `W${i}`;

  week.classList.add("week");

  const end =
    weekEndDate(i);

  if(now > end){

    week.classList.add("completed");

    week.addEventListener("click", () => {

      modalContent.innerHTML =
        completedWeeks[i]
        || "<p>No data</p>";

      backdrop.classList.remove("hidden");
      modal.classList.remove("hidden");

      requestAnimationFrame(() => {

        backdrop.classList.add("active");
        modal.classList.add("active");

      });
    });
  }

  else
    week.classList.add("locked");

  weeksGrid.appendChild(week);
}

// ================== GLOBAL TIMER ==================
let latestTimeString = "";

setInterval(() => {

  const diff =
    targetDate - Date.now();

  if(diff <= 0){

    latestTimeString =
      "00:00:00";

    return;
  }

  const h =
    Math.floor(diff/3600000);

  const m =
    Math.floor((diff/60000)%60);

  const s =
    Math.floor((diff/1000)%60);

  latestTimeString =
    `${h.toString().padStart(2,"0")}:`
  + `${m.toString().padStart(2,"0")}:`
  + `${s.toString().padStart(2,"0")}`;

},1000);

// ================== LIVE MODAL TIMER ==================
let gateTimerInterval = null;

function startGateTimerLive(){

  const box =
    document.getElementById("gateTimerBox");

  if(!box) return;

  if(gateTimerInterval)
    clearInterval(gateTimerInterval);

  gateTimerInterval =
    setInterval(()=>{

      box.textContent =
        latestTimeString;

    },1000);
}

function stopGateTimerLive(){

  if(gateTimerInterval){

    clearInterval(gateTimerInterval);

    gateTimerInterval = null;
  }
}


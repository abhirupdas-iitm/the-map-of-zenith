// ================== CONFIG ==================
const START_DATE = new Date("2026-02-01T00:00:00");
const TOTAL_WEEKS = 52;
const TOTAL_DAYS = 365;

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
const submitDailyLogBtn = document.getElementById("submitDailyLog");

let activeWeek = null;

// ================== DAILY LOG STORAGE ==================
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

// ================== FALLBACK PROMPT ==================
if (!dailyLogs[todayKey()]) {
  const entry = prompt("Write today's log (fallback mode):");

  if (entry && entry.trim()) {
    dailyLogs[todayKey()] = {
      reflection: entry.trim(),
      timestamp: Date.now()
    };
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

	if (dailyLogs[todayKey()] && dailyLogs[todayKey()].hours !== undefined) {
	  alert("Today's structured log already exists.");
	  return;
	}
	
	modalContent.innerHTML = `
	<h3>Daily Log — ${todayKey()}</h3>
	
	<label>
	Hours Studied (0–14)
	<span id="hoursError" class="error-text"></span>
	</label>
	<input
	type="number"
	id="logHours"
	min="0"
	max="14"
	step="0.5"
	placeholder="Enter hours (max 14)"
	required
	>
	
	<label>
	Tasks Completed (describe briefly)
	<span id="tasksError" class="error-text"></span>
	</label>
	<textarea
	id="logTasks"
	placeholder="Must contain words"
	required
	></textarea>
	
	<label>
	Plan Adherence: <span id="adherenceValue">5</span>/10
	</label>
	<input
	type="range"
	id="logAdherence"
	min="0"
	max="10"
	value="5"
	class="blue-slider"
	>
	
	<label>
	Self Rating: <span id="ratingValue">5</span>/10
	</label>
	<input
	type="range"
	id="logRating"
	min="0"
	max="10"
	value="5"
	class="blue-slider"
	>
	
	<label>
	Reflection
	<span id="reflectionError" class="error-text"></span>
	</label>
	<textarea
	id="logReflection"
	placeholder="Must contain real words"
	required
	></textarea>
	
	<button id="saveLogBtn" class="progress-btn">
	Save Log
      </button>
      `;
	
// live slider labels
	const adherenceSlider = document.getElementById("logAdherence");
	const ratingSlider = document.getElementById("logRating");
	
	const adherenceValue = document.getElementById("adherenceValue");
	const ratingValue = document.getElementById("ratingValue");
	
	adherenceSlider.oninput = () =>
	  adherenceValue.textContent = adherenceSlider.value;
	
	ratingSlider.oninput = () =>
	  ratingValue.textContent = ratingSlider.value;

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

	document.getElementById("saveLogBtn").onclick = () => {
	
	const hours =
	Number(document.getElementById("logHours").value);
	
	const tasks =
	document.getElementById("logTasks").value.trim();
	
	const adherence =
	Number(document.getElementById("logAdherence").value);
	
	const rating =
	Number(document.getElementById("logRating").value);
	
	const reflection =
	document.getElementById("logReflection").value.trim();
	
	let valid = true;
	
	// reset errors
	document.getElementById("hoursError").textContent = "";
	document.getElementById("tasksError").textContent = "";
	document.getElementById("reflectionError").textContent = "";
	
	// hours validation
	if (isNaN(hours) || hours < 0 || hours > 14) {
	
	document.getElementById("hoursError").textContent =
	" Input must be between 0–14 hours";
	
	valid = false;
	}
	
	// tasks must contain letters
	if (!/[a-zA-Z]/.test(tasks)) {

	document.getElementById("tasksError").textContent =
	" Must contain real words";
	
	valid = false;
	}
	
	// reflection must contain letters
	if (!/[a-zA-Z]/.test(reflection)) {
	
	document.getElementById("reflectionError").textContent =
	" Reflection must contain words";
	
	valid = false;
	}
	
	if (!valid) return;
	
	// performance calculation
	const performance =
	(hours / 11 * 4) +
	(adherence * 0.3) +
	(rating * 0.3);
	
	// save immutable log
	dailyLogs[todayKey()] = {
	
	hours,
	tasks,
	adherence,
	rating,
	reflection,
	performance: Math.min(performance, 10),
	timestamp: Date.now()
	
	};
	
	saveLogs(dailyLogs);
	
	closeModal();
	
};

});

}

// ================== GATE TIMER MODAL ==================
const openGateTimerBtn = document.getElementById("openGateTimer");

if (openGateTimerBtn) {

  openGateTimerBtn.addEventListener("click", () => {

    modalContent.innerHTML = `
      <div class="gate-timer">
        <img src="rabbit-clock.png">
        <div class="timer-box" id="gateTimerBox">--:--:--</div>
      </div>
    `;

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    requestAnimationFrame(() => {
      backdrop.classList.add("active");
      modal.classList.add("active");
    });

    startGateTimerLive();
  });
}

// ================== LOGS MODAL ==================
if (openLogsBtn) {

  openLogsBtn.addEventListener("click", () => {

    modalContent.innerHTML = "<h3>Daily Logs</h3>";

    const ul = document.createElement("ul");
    ul.className = "logs-list";

    const keys = Object.keys(dailyLogs).sort().reverse();

    if (!keys.length) ul.innerHTML = "<li>No logs yet.</li>";

    keys.forEach(date => {

      const li = document.createElement("li");

      const log = dailyLogs[date];

      li.innerHTML = `
        <span class="log-date">${date}</span>
        <span class="log-preview">
          ${log.reflection ? log.reflection.slice(0, 60) : "Structured log"}
        </span>
      `;

      li.onclick = () => {

        modalContent.innerHTML =
          `<h3>${date}</h3><pre>${
            JSON.stringify(log, null, 2)
          }</pre>`;
      };

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

// ================== YEAR PROGRESS ==================
const today = new Date();

const daysPassed = Math.floor(
  (today - START_DATE) / (1000*60*60*24)
);

const progress = Math.min(Math.max(daysPassed/TOTAL_DAYS,0),1);

document.querySelector(".progress-fill").style.width =
  `${progress*100}%`;

// ================== COMPLETED WEEKS CONTENT ==================
const completedWeeks = {

  1: `
<strong>Week 1 (Feb 1 – Feb 7)</strong>
<ul class="week-list">
<li>Maths: Discrete Math (Sets, Logic, Relations)</li>
<li>DSA: Arrays, Stacks, Queues</li>
<li>DBMS: ER Model, Relational Model</li>
<li>PYQs: Discrete + Arrays</li>
<li>Admin: IITM term settling</li>
</ul>
`,

  2: `
<strong>Week 2 (Feb 8 – Feb 14)</strong>
<ul class="week-list">
<li>Maths: Functions, Graph Basics</li>
<li>DSA: Linked Lists</li>
<li>DBMS: Relational Algebra</li>
<li>PYQs: Discrete full + LL</li>
</ul>
`,

  3: `
<strong>Week 3 (Feb 15 – Feb 21)</strong>
<ul class="week-list">
<li>Maths: Linear Alegbra (Vector Spaces and Rank)</li>
<li>DSA: Trees (BSTs, Traversals)</li>
<li>DBMS: SQL Basics</li>
<li>PYQs: LA + Trees</li>
<li>IITM Quiz-1 proximity → reducing PYQs volume, not theory</li>
</ul>
`

};

// ================== GENERATE WEEKS ==================
const now = new Date();

for (let i=1;i<=TOTAL_WEEKS;i++){

  const week=document.createElement("div");

  week.textContent=`W${i}`;
  week.classList.add("week");

  const end=new Date(
    START_DATE.getTime()+i*7*24*60*60*1000
  );

  if(now>end){

    week.classList.add("completed");

    week.onclick=()=>{
      modalContent.innerHTML=
        completedWeeks[i]||
        "<p>No data for this week.</p>";

      backdrop.classList.remove("hidden");
      modal.classList.remove("hidden");

      requestAnimationFrame(()=>{
        backdrop.classList.add("active");
        modal.classList.add("active");
      });
    };

  }else{
    week.classList.add("locked");
  }

  weeksGrid.appendChild(week);
}

// ================== STREAK ==================
(function(){

const dates=Object.keys(dailyLogs).sort();

let current=0;
let best=0;

for(let i=0;i<dates.length;i++){

  if(i===0) current=1;

  else{

    const diff=
      (new Date(dates[i])-
       new Date(dates[i-1]))
      /(1000*60*60*24);

    current=diff===1?current+1:1;
  }

  best=Math.max(best,current);
}

document.getElementById("currentStreak").textContent=current;
document.getElementById("bestStreak").textContent=best;
document.getElementById("streakFill").style.width=
  `${Math.min(current,30)/30*100}%`;

})();

// ================== TIMER ==================
let latestTimeString="";

setInterval(()=>{

const diff=targetDate-Date.now();

if(diff<=0){

latestTimeString="00:00:00";
return;

}

const hours=Math.floor(diff/(1000*60*60));
const minutes=Math.floor((diff/(1000*60))%60);
const seconds=Math.floor((diff/1000)%60);

latestTimeString=
`${hours.toString().padStart(2,"0")}:`+
`${minutes.toString().padStart(2,"0")}:`+
`${seconds.toString().padStart(2,"0")}`;

},1000);

// ================== LIVE TIMER ==================
let gateTimerInterval=null;

function startGateTimerLive(){

const box=document.getElementById("gateTimerBox");

if(!box) return;

gateTimerInterval=setInterval(()=>{
box.textContent=latestTimeString;
},1000);

}

function stopGateTimerLive(){

if(gateTimerInterval){

clearInterval(gateTimerInterval);
gateTimerInterval=null;

}

}

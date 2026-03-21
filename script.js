document.addEventListener("DOMContentLoaded", async function () {
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
    const openAnalyticsBtn = document.getElementById("openAnalytics");

    let activeWeek = null;


    // ================== DAILY LOG STORAGE (FIRESTORE-BACKED) ==================
    // db.loadLogs() and db.saveLogs() are provided by db.js (Firestore + localStorage cache)
    const dailyLogs = await db.loadLogs();

    function todayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")
            }-${String(now.getDate()).padStart(2, "0")
            }`;
    }

    function previousDay(dateStr) {
        const d = new Date(dateStr);
        d.setDate(d.getDate() - 1);

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")
            }-${String(d.getDate()).padStart(2, "0")
            }`;
    }


    // ================== FALLBACK PROMPT ==================

    const role = sessionStorage.getItem("zenith_role");
    const isAdmin = role === "admin";

    if (isAdmin && !dailyLogs[todayKey()]) {

        const entry = prompt("Write today's log (fallback mode):");

        if (entry && entry.trim()) {

            dailyLogs[todayKey()] = {
                reflection: entry.trim(),
                timestamp: Date.now()
            };

            await db.saveLogs(dailyLogs);
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

            const today = todayKey();
            const todayLog = dailyLogs[today];

            const isFullSubmission =
                todayLog &&
                todayLog.hours !== undefined &&
                todayLog.performance !== undefined;

            if (isFullSubmission) {
                alert("Log already submitted for today. Entries are immutable.");
                return;
            }

            modalContent.innerHTML = `
        <h3>Daily Log — ${todayKey()}</h3>

        <label>
        Hours Studied (0–14)
        <span id="hoursError" class="error-text"></span>
        </label>
        <input type="number" id="logHours" min="0" max="14" step="0.5">

        <label>
        Tasks Completed (describe briefly)
        <span id="tasksError" class="error-text"></span>
        </label>
        <textarea id="logTasks"></textarea>

        <label>
        Plan Adherence: <span id="adherenceValue">5</span>/10
        </label>
        <input type="range" id="logAdherence" min="0" max="10" value="5" class="blue-slider">

        <label>
        Self Rating: <span id="ratingValue">5</span>/10
        </label>
        <input type="range" id="logRating" min="0" max="10" value="5" class="blue-slider">

        <label>
        Reflection
        <span id="reflectionError" class="error-text"></span>
        </label>
        <textarea id="logReflection"></textarea>

        <button id="saveLogBtn" class="progress-btn">
        Save Log
        </button>
        `;

            const adherenceSlider = document.getElementById("logAdherence");
            const ratingSlider = document.getElementById("logRating");

            adherenceSlider.oninput =
                () => document.getElementById("adherenceValue").textContent = adherenceSlider.value;

            ratingSlider.oninput =
                () => document.getElementById("ratingValue").textContent = ratingSlider.value;

            backdrop.classList.remove("hidden");
            modal.classList.remove("hidden");

            requestAnimationFrame(() => {
                backdrop.classList.add("active");
                modal.classList.add("active");
            });

            document.getElementById("saveLogBtn").onclick = async () => {

                const hours = Number(document.getElementById("logHours").value);
                const tasks = document.getElementById("logTasks").value.trim();
                const adherence = Number(document.getElementById("logAdherence").value);
                const rating = Number(document.getElementById("logRating").value);
                const reflection = document.getElementById("logReflection").value.trim();

                let valid = true;

                document.getElementById("hoursError").textContent = "";
                document.getElementById("tasksError").textContent = "";
                document.getElementById("reflectionError").textContent = "";

                if (isNaN(hours) || hours < 0 || hours > 14) {
                    document.getElementById("hoursError").textContent = " Input must be between 0–14 hours";
                    valid = false;
                }

                if (!/[a-zA-Z]/.test(tasks)) {
                    document.getElementById("tasksError").textContent = " Must contain real words";
                    valid = false;
                }

                if (!/[a-zA-Z]/.test(reflection)) {
                    document.getElementById("reflectionError").textContent = " Reflection must contain words";
                    valid = false;
                }

                if (!valid) return;

                const performance =
                    (hours / 11 * 4) +
                    (adherence * 0.3) +
                    (rating * 0.3);

                dailyLogs[todayKey()] = {
                    hours,
                    tasks,
                    adherence,
                    rating,
                    reflection,
                    performance: Math.min(performance, 10),
                    timestamp: Date.now()
                };

                await db.saveLogs(dailyLogs);
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
                        `<h3>${date}</h3><pre>${JSON.stringify(log, null, 2)
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
        (today - START_DATE) / (1000 * 60 * 60 * 24)
    );

    const progress = Math.min(Math.max(daysPassed / TOTAL_DAYS, 0), 1);

    document.querySelector(".progress-fill").style.width =
        `${progress * 100}%`;

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
`,

        4: `
<strong>Week 4 (Feb 22 – Feb 28)</strong>
<ul class="week-list">
<li>Maths: Eigenvalues, SVD</li>
<li>DSA: Hashing</li>
<li>DBMS: SQL Joins, Subqueries</li>
<li>PYQs: LA + Hashing</li>
</ul>
`,

        5: `
<strong>Week 5 (Mar 1 – Mar 7)</strong>
<ul class="week-list">
<li>Maths: Probability Basics</li>
<li>DSA: Sorting (Bubble, Insertion and Selection)</li>
<li>DBMS: Normalization (1NF - 3NF)</li>
<li>PYQs: Probability + Sorting</li>
</ul>
`,

        6: `
<strong>Week 6 (Mar 8 – Mar 14)</strong>
<ul class="week-list">
<li>Maths: Random variables, Distributions</li>
<li>DSA: MergeSort, Quicksort</li>
<li>DBMS: Indexing</li>
<li>PYQs: Probability + D&C</li>
</ul>
`
    };

    // ================== GENERATE WEEKS ==================
    const now = new Date();

    for (let i = 1; i <= TOTAL_WEEKS; i++) {
        const week = document.createElement("div");

        week.textContent = `W${i}`;
        week.classList.add("week");

        const end = new Date(
            START_DATE.getTime() + i * 7 * 24 * 60 * 60 * 1000
        );

        if (now > end) {

            week.classList.add("completed");

            week.onclick = () => {
                modalContent.innerHTML =
                    completedWeeks[i] ||
                    "<p>No data for this week.</p>";

                backdrop.classList.remove("hidden");
                modal.classList.remove("hidden");

                requestAnimationFrame(() => {
                    backdrop.classList.add("active");
                    modal.classList.add("active");
                });
            };

        } else {
            week.classList.add("locked");
        }

        weeksGrid.appendChild(week);
    }

    // ================== STREAK ==================
    (function () {

        const dates = Object.keys(dailyLogs)
            .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
            .sort((a, b) => new Date(a) - new Date(b));

        let current = 0;
        let best = 0;
        let running = 0;

        for (let i = 0; i < dates.length; i++) {

            if (i === 0) {
                running = 1;
            }
            else {

                const prev = new Date(dates[i - 1]);
                const curr = new Date(dates[i]);

                const diff =
                    (curr - prev) / (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    running++;
                } else {
                    running = 1;
                }
            }

            best = Math.max(best, running);
        }

        current = running;

        document.getElementById("currentStreak").textContent = current;
        document.getElementById("bestStreak").textContent = best;

        document.getElementById("streakFill").style.width =
            `${Math.min(current, 30) / 30 * 100}%`;

    })();


    // ================== TIMER ==================
    let latestTimeString = "";

    setInterval(() => {

        const diff = targetDate - Date.now();

        if (diff <= 0) {

            latestTimeString = "00:00:00";
            return;

        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        latestTimeString =
            `${hours.toString().padStart(2, "0")}:` +
            `${minutes.toString().padStart(2, "0")}:` +
            `${seconds.toString().padStart(2, "0")}`;

    }, 1000);

    // ================== LIVE TIMER ==================
    let gateTimerInterval = null;

    function startGateTimerLive() {

        const box = document.getElementById("gateTimerBox");

        if (!box) return;

        gateTimerInterval = setInterval(() => {
            box.textContent = latestTimeString;
        }, 1000);

    }

    function stopGateTimerLive() {

        if (gateTimerInterval) {

            clearInterval(gateTimerInterval);
            gateTimerInterval = null;

        }

    }

    // ================== ANALYTICS BUTTON ==================
    if (openAnalyticsBtn) {

        openAnalyticsBtn.addEventListener("click", () => {

            modalContent.innerHTML = `
<h3>Performance vs Emotional State</h3>

<label>Start Date</label>
<input type="date" id="analyticsStart">

<label>End Date</label>
<input type="date" id="analyticsEnd">

<div style="margin-top:10px;margin-bottom:10px;">
<button id="range7" class="progress-btn">Last 7 Days</button>
<button id="range30" class="progress-btn">Last 30 Days</button>
<button id="range90" class="progress-btn">Last 90 Days</button>
<button id="rangeAll" class="progress-btn">All Time</button>
</div>

<button id="applyAnalyticsRange" class="progress-btn">
Apply Range
</button>

<canvas id="analyticsChart"></canvas>
`;

            backdrop.classList.remove("hidden");
            modal.classList.remove("hidden");

            requestAnimationFrame(() => {
                backdrop.classList.add("active");
                modal.classList.add("active");
            });

            renderAnalyticsChart();
            document.getElementById("applyAnalyticsRange").onclick = () => {
                renderAnalyticsChart();
            };

            function setRange(days) {

                const end = new Date();
                const start = new Date();

                start.setDate(end.getDate() - days);

                document.getElementById("analyticsStart").value =
                    start.toISOString().split("T")[0];

                document.getElementById("analyticsEnd").value =
                    end.toISOString().split("T")[0];

                renderAnalyticsChart();

            }

            document.getElementById("range7").onclick = () => setRange(7);

            document.getElementById("range30").onclick = () => setRange(30);

            document.getElementById("range90").onclick = () => setRange(90);

            document.getElementById("rangeAll").onclick = () => {

                document.getElementById("analyticsStart").value = "";
                document.getElementById("analyticsEnd").value = "";

                renderAnalyticsChart();

            };

        });

    }


    // ================== ANALYTICS CHART ==================
    let analyticsChartInstance = null;

    function renderAnalyticsChart() {

        const ctx = document.getElementById("analyticsChart");

        const start = document.getElementById("analyticsStart")?.value;
        const end = document.getElementById("analyticsEnd")?.value;

        let dates = Object.keys(dailyLogs)
            .filter(d => dailyLogs[d].performance !== undefined)
            .sort((a, b) => new Date(a) - new Date(b));

        if (start)
            dates = dates.filter(d => d >= start);

        if (end)
            dates = dates.filter(d => d <= end);

        const academic = [];
        const emotional = [];

        dates.forEach(date => {

            const log = dailyLogs[date];

            if (log.performance !== undefined && log.rating !== undefined) {

                academic.push(log.performance);
                emotional.push(log.rating);

            }

        });

        // Destroy existing chart before creating a new one
        if (analyticsChartInstance) {
            analyticsChartInstance.destroy();
            analyticsChartInstance = null;
        }

        analyticsChartInstance = new Chart(ctx, {

            type: "line",

            data: {

                labels: dates,

                datasets: [

                    {
                        label: "Academic Output",
                        data: academic,
                        borderColor: "#22c55e",
                        backgroundColor: "transparent",
                        tension: 0.35
                    },

                    {
                        label: "Mental State",
                        data: emotional,
                        borderColor: "#ef4444",
                        backgroundColor: "transparent",
                        tension: 0.35
                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {
                    legend: {
                        labels: {
                            color: "#e5e7eb"
                        }
                    }
                },

                scales: {

                    x: {
                        ticks: { color: "#94a3b8" }
                    },

                    y: {
                        min: 0,
                        max: 10,
                        ticks: { color: "#94a3b8" }
                    }

                }

            }

        });

    }

});

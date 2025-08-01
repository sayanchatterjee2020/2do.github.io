
// --- NAME STORAGE ---
window.onload = function () {
    resetIfNewWeek(); // Reset weekly stats if Sunday

    const name = localStorage.getItem('userName');
    if (name) {
        document.getElementById('greeting').innerText = `${name}!`;
        document.getElementById('modalGreeting').innerText = `Hello ,${name}!`;
        document.getElementById('nameInputSection').style.display = 'none';
    }

    loadTasks();

    const weeklyData = JSON.parse(localStorage.getItem("weeklyData")) || {};
    updateWeeklyStats(weeklyData);
};

function saveName() {
    const name = document.getElementById('nameInput').value.trim();
    if (name) {
        localStorage.setItem('userName', name);
        document.getElementById('greeting').innerText = `${name}!`;
        document.getElementById('modalGreeting').innerText = `${name}!`;
        document.getElementById('nameInputSection').style.display = 'none';
    }
}

// --- DATE KEY HELPERS ---
function getTodayDateKey() {
    return new Date().toISOString().split("T")[0]; // e.g., 2025-08-01
}

function getTodayStatusKey() {
    return `taskStatus-${getTodayDateKey()}`;
}

// --- TASK SYSTEM ---
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();
    if (!text) return;

    let masterList = JSON.parse(localStorage.getItem("taskMasterList")) || [];
    masterList.push(text);
    localStorage.setItem("taskMasterList", JSON.stringify(masterList));

    const statusKey = getTodayStatusKey();
    let statusList = JSON.parse(localStorage.getItem(statusKey)) || [];
    statusList.push(false); // new task, not done yet
    localStorage.setItem(statusKey, JSON.stringify(statusList));

    taskInput.value = "";
    loadTasks();
}

function loadTasks() {
    const masterList = JSON.parse(localStorage.getItem("taskMasterList")) || [];
    const statusKey = getTodayStatusKey();
    let statusList = JSON.parse(localStorage.getItem(statusKey));

    if (!statusList || statusList.length !== masterList.length) {
        // Align with masterList length
        statusList = new Array(masterList.length).fill(false);
        localStorage.setItem(statusKey, JSON.stringify(statusList));
    }

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    masterList.forEach((text, i) => {
        const li = document.createElement("li");
        li.className = statusList[i] ? "done" : "";

        const span = document.createElement("span");
        span.textContent = text;

        const doneBtn = document.createElement("button");
        doneBtn.textContent = statusList[i] ? "Undo" : "Done";
        doneBtn.className = "done";
        doneBtn.onclick = () => toggleDone(i);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.className = "delete";
        delBtn.onclick = () => deleteTask(i);

        li.appendChild(span);
        li.appendChild(doneBtn);
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });

    updateProgressWithMaster(masterList, statusList);
}

function toggleDone(index) {
    const statusKey = getTodayStatusKey();
    let statusList = JSON.parse(localStorage.getItem(statusKey)) || [];
    statusList[index] = !statusList[index];
    localStorage.setItem(statusKey, JSON.stringify(statusList));
    loadTasks();
}

function deleteTask(index) {
    let masterList = JSON.parse(localStorage.getItem("taskMasterList")) || [];
    masterList.splice(index, 1);
    localStorage.setItem("taskMasterList", JSON.stringify(masterList));

    const statusKey = getTodayStatusKey();
    let statusList = JSON.parse(localStorage.getItem(statusKey)) || [];
    statusList.splice(index, 1);
    localStorage.setItem(statusKey, JSON.stringify(statusList));

    loadTasks();
}

// --- PROGRESS & WEEKLY STATS ---
function updateProgressWithMaster(masterList, statusList) {
    const taskCounter = document.getElementById("taskCounter");
    const progressBar = document.getElementById("progressBar");

    const total = masterList.length;
    const done = statusList.filter(x => x).length;

    taskCounter.textContent = `${done}/${total}`;
    const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = percentage > 0 ? `${percentage}%` : "";

    saveDailyStats(done, total);
}

function saveDailyStats(done, total) {
    const today = new Date();
    const dayName = today.toLocaleString('en-US', { weekday: 'short' }); // Sun, Mon...
    let weeklyData = JSON.parse(localStorage.getItem("weeklyData")) || {};
    weeklyData[dayName] = { done, total };
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData));
    updateWeeklyStats(weeklyData);
}

function updateWeeklyStats(weeklyData) {
    const weeklyContainer = document.getElementById("weeklyStats");
    weeklyContainer.innerHTML = "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let totalDone = 0;
    let totalTasks = 0;

    days.forEach(day => {
        const stats = weeklyData[day];
        const text = stats ? `${stats.done}/${stats.total}` : "0/0";
        weeklyContainer.innerHTML += `<li><strong>${day}:</strong>  ${text}</li>`;
        if (stats) {
            totalDone += stats.done;
            totalTasks += stats.total;
        }
    });

    const percent = totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100);
    weeklyContainer.innerHTML += `<li><strong>Total: ${totalDone}/${totalTasks} = ${percent}%</strong></li>`;
    if (percent >= 70) {
        weeklyContainer.innerHTML += `<li style="color:green" class="good-li">👍 Good week!</li>`;
    } else {
        weeklyContainer.innerHTML += `<li style="color:red" class="bad-li">👎 Bad week!</li>`;
    }
}

function resetIfNewWeek() {
    const today = new Date();
    if (today.getDay() === 0) { // Sunday
        localStorage.removeItem("weeklyData");
    }
}

// --- Reset all data button ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('resetAllBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to delete ALL stored data? This will reset everything.")) {
            localStorage.clear();
            alert("All local storage data has been erased.");
            location.reload();
        }
    });
});


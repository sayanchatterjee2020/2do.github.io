// --- NAME STORAGE ---
window.onload = function () {
    resetIfNewWeek(); // reset weekly data if Sunday

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

// --- TASK STORAGE ---
function getTodayKey() {
    const today = new Date().toISOString().split("T")[0];
    return `tasks-${today}`;
}

function loadTasks() {
    const key = getTodayKey();
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach((task, i) => {
        const li = document.createElement("li");
        li.className = task.done ? "done" : "";

        const span = document.createElement("span");
        span.textContent = task.text;

        const doneBtn = document.createElement("button");
        doneBtn.textContent = task.done ? "Undo" : "Done";
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

    updateProgress(tasks);
}

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();
    if (!text) return;
    const key = getTodayKey();
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    tasks.push({ text, done: false });
    localStorage.setItem(key, JSON.stringify(tasks));
    taskInput.value = "";
    loadTasks();
}

function toggleDone(index) {
    const key = getTodayKey();
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    tasks[index].done = !tasks[index].done;
    localStorage.setItem(key, JSON.stringify(tasks));
    loadTasks();
}

function deleteTask(index) {
    const key = getTodayKey();
    const tasks = JSON.parse(localStorage.getItem(key)) || [];
    tasks.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(tasks));
    loadTasks();
}

// --- Progress and Weekly Stats ---
function updateProgress(tasks) {
    const taskCounter = document.getElementById("taskCounter");
    const progressBar = document.getElementById("progressBar");

    const total = tasks.length;
    const done = tasks.filter(task => task.done).length;

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
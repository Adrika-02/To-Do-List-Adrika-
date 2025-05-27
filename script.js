const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");
const taskList = document.getElementById("taskList");
const taskListInfo = document.getElementById("taskListInfo");
const calendar = document.getElementById("calendar");
const calendarHeader = document.getElementById("calendarHeader");
const toggleCompleted = document.getElementById("toggleCompleted");
const viewAllBtn = document.getElementById("viewAllBtn");
const allTasksModal = document.getElementById("allTasksModal");
const allTasksList = document.getElementById("allTasksList");
const closeModal = document.querySelector(".close");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date().toDateString();

let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};

function saveTasks() {
  localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
}

function renderCalendar(month, year) {
  calendar.innerHTML = "";
  calendarHeader.innerHTML = `
    <button onclick="changeMonth(-1)">‹</button>
    ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}
    <button onclick="changeMonth(1)">›</button>
  `;

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "day";
    cell.textContent = day;
    grid.appendChild(cell);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateCell = document.createElement("div");
    const cellDate = new Date(year, month, d);

    dateCell.className = "date";
    dateCell.textContent = d;

    if (cellDate.toDateString() === selectedDate) {
      dateCell.classList.add("selected");
    }

    dateCell.addEventListener("click", () => {
      selectedDate = cellDate.toDateString();
      renderCalendar(month, year);
      renderTasks();
    });

    grid.appendChild(dateCell);
  }

  calendar.appendChild(grid);
}

function renderTasks() {
  taskList.innerHTML = "";

  const showCompleted = toggleCompleted.checked;
  const tasks = tasksByDate[selectedDate] || [];
  const filteredTasks = showCompleted ? tasks : tasks.filter(t => !t.done);

  taskListInfo.textContent = filteredTasks.length === 0
    ? `No tasks scheduled for ${selectedDate}.`
    : `Tasks for ${selectedDate}:`;

  filteredTasks.forEach((taskObj, index) => {
    const li = document.createElement("li");
    if (taskObj.done) li.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = taskObj.done;
    checkbox.onchange = () => {
      taskObj.done = checkbox.checked;
      saveTasks();
      renderTasks();
    };

    const span = document.createElement("span");
    span.textContent = taskObj.text;
    span.style.flex = 1;
    span.style.marginLeft = "8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.onclick = () => {
      const newText = prompt("Edit task:", taskObj.text);
      if (newText !== null) {
        taskObj.text = newText.trim();
        saveTasks();
        renderTasks();
      }
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "✖";
    delBtn.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    };

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);

    taskList.appendChild(li);
  });
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
}

addBtn.addEventListener("click", () => {
  const taskText = taskInput.value.trim();
  if (!taskText) return;

  const taskObj = { text: taskText, done: false };

  if (!tasksByDate[selectedDate]) {
    tasksByDate[selectedDate] = [];
  }

  tasksByDate[selectedDate].push(taskObj);
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

clearBtn.addEventListener("click", () => {
  if (confirm(`Clear all tasks for ${selectedDate}?`)) {
    delete tasksByDate[selectedDate];
    saveTasks();
    renderTasks();
  }
});

toggleCompleted.addEventListener("change", renderTasks);

viewAllBtn.addEventListener("click", () => {
  allTasksList.innerHTML = "";
  const dates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));

  if (dates.length === 0) {
    allTasksList.innerHTML = "<li>No tasks available.</li>";
  } else {
    dates.forEach(date => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${date}:</strong><ul>${tasksByDate[date].map(task =>
        `<li${task.done ? ' style="text-decoration: line-through;opacity:0.6;"' : ''}>${task.text}</li>`
      ).join('')}</ul>`;
      allTasksList.appendChild(li);
    });
  }

  allTasksModal.style.display = "block";
});

closeModal.onclick = () => {
  allTasksModal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === allTasksModal) {
    allTasksModal.style.display = "none";
  }
};

renderCalendar(currentMonth, currentYear);
renderTasks();

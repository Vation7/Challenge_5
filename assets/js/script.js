$(document).ready(function () {
  // Retrieve tasks and nextId from localStorage
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

  // Todo: create a function to generate a unique task id
  function generateTaskId() {
    return nextId++;
  }

  // Todo: create a function to create a task card
  function createTaskCard(task) {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.id = `task-${task.id}`;
    card.draggable = true;

    const today = dayjs();
    const dueDate = dayjs(task.dueDate);
    let colorClass = "";
    if (dueDate.isBefore(today, "day")) {
      colorClass = "bg-danger";
    } else if (dueDate.isSame(today, "day")) {
      colorClass = "bg-warning";
    }
    card.innerHTML = `
      <div class="card-body ${colorClass}">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="due-date">Due: ${dueDate.format("YYYY-MM-DD")}</p>
        <button class="btn btn-danger delete-btn">Delete</button>
      </div>
    `;
    return card;
  }

  // Todo: create a function to render the task list and make cards draggable
  function renderTaskList() {
    const todoCards = document.getElementById("todo-cards");
    const inProgressCards = document.getElementById("in-progress-cards");
    const doneCards = document.getElementById("done-cards");

    todoCards.innerHTML = "";
    inProgressCards.innerHTML = "";
    doneCards.innerHTML = "";

    taskList.forEach((task) => {
      const card = createTaskCard(task);
      if (task.status === "todo") {
        todoCards.appendChild(card);
      } else if (task.status === "in-progress") {
        inProgressCards.appendChild(card);
      } else if (task.status === "done") {
        doneCards.appendChild(card);
      }
    });

    makeCardsDraggable();
  }

  // Todo: create a function to handle adding a new task
  function handleAddTask(event) {
    event.preventDefault();
    const form = event.target;
    const title = form.querySelector("#title").value;
    const description = form.querySelector("#description").value;
    const dueDate = form.querySelector("#due-date").value;

    const newTask = {
      id: generateTaskId(),
      title: title,
      description: description,
      dueDate: dueDate,
      status: "todo",
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));

    renderTaskList();
    form.reset();
    $("#formModal").modal("hide");
  }

  // Todo: create a function to handle deleting a task
  function handleDeleteTask(event) {
    const taskId = event.target.closest(".task-card").id;
    const taskIdNumber = parseInt(taskId.split("-")[1]);
    taskList = taskList.filter((task) => task.id !== taskIdNumber);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }

  // Todo: create a function to handle dropping a task into a new status lane
  function handleDrop(event, ui) {
    const cardId = ui.draggable.attr("id");
    const taskId = parseInt(cardId.split("-")[1]);
    const newStatus = event.target.closest(".lane").id;

    const taskIndex = taskList.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const task = taskList.splice(taskIndex, 1)[0];
    task.status = newStatus;

    if (newStatus === "todo") {
      taskList.unshift(task);
    } else {
      const newIndex = taskList.findIndex((t) => t.status === newStatus);
      taskList.splice(newIndex !== -1 ? newIndex : taskList.length, 0, task);
    }

    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
  }

  function makeCardsDraggable() {
    $(".task-card").draggable({
      revert: "invalid",
      stack: ".task-card",
      helper: "clone",
    });
  }

  renderTaskList();
  $("#add-task-form").submit(handleAddTask);
  $(document).on("click", ".delete-btn", handleDeleteTask);
  $(".lane").droppable({
    drop: handleDrop,
  });
  $("#due-date").datepicker();
});

// Get elements from the HTML
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const newListBtn = document.getElementById("newListBtn");
const listSelect = document.getElementById("listSelect");
const themeBtn = document.getElementById("themeBtn");
const deleteListBtn = document.getElementById("deleteListBtn");
const renameListBtn = document.getElementById("renameListBtn");


// ------------------------------------
// LIST DATA
// ------------------------------------

// Get saved lists from localStorage
let lists = JSON.parse(localStorage.getItem("todoLists")) || {};


// If there are no lists yet, create a default one
if (Object.keys(lists).length === 0) {

    lists["My Tasks"] = [];

    localStorage.setItem(
        "todoLists",
        JSON.stringify(lists)
    );
}


// Keep track of the currently selected list
let currentListName =
    localStorage.getItem("currentList") || Object.keys(lists)[0];


// Make sure the current list still exists
if (!lists[currentListName]) {
    currentListName = Object.keys(lists)[0];
}


// Get the tasks from the current list
let tasks = lists[currentListName];


// ------------------------------------
// DISPLAY LISTS
// ------------------------------------

function displayLists() {

    listSelect.innerHTML = "";

    Object.keys(lists).forEach(function(listName) {

        const option = document.createElement("option");

        option.value = listName;
        option.textContent = listName;

        if (listName === currentListName) {
            option.selected = true;
        }

        listSelect.appendChild(option);
    });
}


// ------------------------------------
// SWITCH LIST
// ------------------------------------

listSelect.addEventListener("change", function() {

    saveCurrentList();

    currentListName = listSelect.value;

    localStorage.setItem(
        "currentList",
        currentListName
    );

    tasks = lists[currentListName];

    displayTasks();
});


// ------------------------------------
// CREATE NEW LIST
// ------------------------------------

newListBtn.addEventListener("click", createNewList);


function createNewList() {

    let listName = prompt(
        "Enter a name for your new list:"
    );


    // User cancelled
    if (listName === null) {
        return;
    }


    listName = listName.trim();


    // Empty name
    if (listName === "") {

        alert("Please enter a name for your list.");

        return;
    }


    // Check if list already exists
    if (lists[listName]) {

        alert(
            "A list with that name already exists."
        );

        return;
    }


    // Save current list
    saveCurrentList();


    // Create new empty list
    lists[listName] = [];


    // Switch to the new list
    currentListName = listName;

    tasks = lists[currentListName];


    // Save everything
    saveLists();


    localStorage.setItem(
        "currentList",
        currentListName
    );


    displayLists();
    displayTasks();


    alert(
        "New list '" + listName + "' has been created."
    );
}


// ------------------------------------
// ADD TASK
// ------------------------------------

addTaskBtn.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {
            addTask();
        }

    }
);


function addTask() {

    const taskText =
        taskInput.value.trim();


    // Don't add empty task
    if (taskText === "") {
        return;
    }


    const newTask = {

        id: Date.now(),

        text: taskText,

        completed: false

    };


    tasks.push(newTask);


    saveCurrentList();

    displayTasks();


    taskInput.value = "";

    taskInput.focus();
}


// ------------------------------------
// DISPLAY TASKS
// ------------------------------------

function displayTasks() {

    taskList.innerHTML = "";


    if (tasks.length === 0) {

        emptyMessage.style.display = "block";

        return;
    }


    emptyMessage.style.display = "none";


    tasks.forEach(function(task) {

        const li =
            document.createElement("li");


        li.classList.add("task");


        if (task.completed) {

            li.classList.add("completed");

        }


        li.innerHTML = `

            <div class="task-left">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <span>${task.text}</span>

            </div>


            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})"
            >
                Delete
            </button>

        `;


        taskList.appendChild(li);

    });
}


// ------------------------------------
// COMPLETE TASK
// ------------------------------------

function toggleTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {

            task.completed =
                !task.completed;

        }

        return task;

    });


    saveCurrentList();

    displayTasks();
}


// ------------------------------------
// DELETE TASK
// ------------------------------------

function deleteTask(id) {

    tasks = tasks.filter(function(task) {

        return task.id !== id;

    });


    saveCurrentList();

    displayTasks();
}


// ------------------------------------
// RESET CURRENT LIST
// ------------------------------------

resetBtn.addEventListener(
    "click",
    resetTasks
);


function resetTasks() {

    if (tasks.length === 0) {

        alert(
            "The current list is already empty."
        );

        return;
    }


    const confirmReset = confirm(

        "Are you sure you want to delete all tasks from '" +
        currentListName +
        "'?"

    );


    if (confirmReset) {

        tasks = [];

        saveCurrentList();

        displayTasks();

    }
}


// ------------------------------------
// SAVE LIST TO TEXT FILE
// ------------------------------------

saveBtn.addEventListener(
    "click",
    saveListToFile
);


function saveListToFile() {

    if (tasks.length === 0) {

        alert(
            "There are no tasks to save."
        );

        return;
    }


    const confirmSave = confirm(

        "Your task list will be saved as a text file. Continue?"

    );


    if (!confirmSave) {
        return;
    }


    let fileName = prompt(

        "Enter a name for your task list:",
        currentListName

    );


    // User cancelled
    if (fileName === null) {
        return;
    }


    fileName = fileName.trim();


    // Empty filename
    if (fileName === "") {

        alert(
            "Please enter a file name."
        );

        return;
    }


    // Remove invalid Windows filename characters
    fileName =
        fileName.replace(
            /[<>:"/\\|?*]/g,
            ""
        );


    if (fileName === "") {

        alert(
            "That is not a valid file name."
        );

        return;
    }


    // Use filename as heading
    let textContent =
        fileName + "\n\n";


    tasks.forEach(function(task) {

        if (task.completed) {

            textContent +=
                "[x] " +
                task.text +
                "\n";

        } else {

            textContent +=
                "[ ] " +
                task.text +
                "\n";

        }

    });


    const file =
        new Blob(
            [textContent],
            {
                type: "text/plain"
            }
        );


    const downloadLink =
        document.createElement("a");


    downloadLink.href =
        URL.createObjectURL(file);


    downloadLink.download =
        fileName + ".txt";


    downloadLink.click();


    URL.revokeObjectURL(
        downloadLink.href
    );
}


// ------------------------------------
// SAVE CURRENT LIST
// ------------------------------------

function saveCurrentList() {

    lists[currentListName] = tasks;

    saveLists();

}


// ------------------------------------
// SAVE ALL LISTS
// ------------------------------------

function saveLists() {

    localStorage.setItem(

        "todoLists",

        JSON.stringify(lists)

    );

}


// ------------------------------------
// DARK / LIGHT MODE
// ------------------------------------

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeBtn.textContent =
        "☀️ Light Mode";
}


themeBtn.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    if (
        document.body.classList.contains(
            "dark-mode"
        )
    ) {

        themeBtn.textContent =
            "☀️ Light Mode";

        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        themeBtn.textContent =
            "🌙 Dark Mode";

        localStorage.setItem(
            "theme",
            "light"
        );

    }
}


// ------------------------------------
// START APP
// ------------------------------------

displayLists();

displayTasks();

deleteListBtn.addEventListener(
    "click",
    deleteCurrentList
);

function deleteCurrentList() {

    const listNames = Object.keys(lists);

    // Don't allow the last list to be deleted
    if (listNames.length === 1) {

        alert(
            "You cannot delete your only list. Create another list first."
        );

        return;
    }


    const confirmDelete = confirm(

        "Are you sure you want to delete '" +
        currentListName +
        "'? All tasks in this list will be deleted."

    );


    if (!confirmDelete) {
        return;
    }


    // Delete the selected list
    delete lists[currentListName];


    // Select another list
    const remainingLists = Object.keys(lists);

    currentListName = remainingLists[0];

    tasks = lists[currentListName];


    // Save changes
    saveLists();

    localStorage.setItem(
        "currentList",
        currentListName
    );


    // Update the interface
    displayLists();
    displayTasks();


    alert(
        "The list has been deleted."
    );
}

renameListBtn.addEventListener(
    "click",
    renameCurrentList
);

function renameCurrentList() {

    let newName = prompt(
        "Enter a new name for '" +
        currentListName +
        "':",
        currentListName
    );


    // User cancelled
    if (newName === null) {
        return;
    }


    newName = newName.trim();


    // Empty name
    if (newName === "") {

        alert(
            "Please enter a name for the list."
        );

        return;
    }


    // Same name
    if (newName === currentListName) {

        alert(
            "The list already has this name."
        );

        return;
    }


    // Check if another list already has this name
    if (lists[newName]) {

        alert(
            "A list with that name already exists."
        );

        return;
    }


    // Keep the existing tasks
    lists[newName] = lists[currentListName];


    // Remove the old list
    delete lists[currentListName];


    // Change current list name
    currentListName = newName;

    tasks = lists[currentListName];


    // Save changes
    saveLists();

    localStorage.setItem(
        "currentList",
        currentListName
    );


    // Update the dropdown
    displayLists();

    displayTasks();


    alert(
        "The list has been renamed to '" +
        newName +
        "'."
    );
}
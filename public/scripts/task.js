$(document).ready(function () {

    // OPEN FORM WHEN PLUS BUTTON IS CLICKED
    $('#add-task-button').click(function () {
        $('#todoInput').toggle();
    })


    $.getJSON("/api/tasks")
        // GET ALL TASKS ON PAGE LOAD
        .then(addTasks)

    // LISTEN FOR ENTER KEY AND CREATE TASK
    $('#todoInput').keypress(function (event) {
        if (event.which === 13) {
            createTask();
        }
    });


    // LISTEN FOR CLICK TO UPDATE
    $('.list').on('click', '#checked-toggle', function () {
        updateTask($(this).parent());

    })


    // LISTEN FOR DELETE CLICK
    $('.list').on('click', 'span', function (e) {
        e.stopPropagation();
        removeTask($(this).parent());
    })



});

// GET ALL TASKS
function addTasks(tasks) {
    tasks.forEach(function (task) {
        addTask(task);
    })

}

// ADD TASK FUNCTION
function addTask(task) {
    var newTask = $('<li class="task">' + task.name + ' <span>X</span><a href"#" id="checked-toggle"><img src="../assets/task_box.png" class="task-checkbox todo"><img src="../assets/task-box-complete.png" class="task-checkbox checked"><a></li>');
    newTask.data('id', task._id);
    newTask.data('completed', task.completed);
    var todo = newTask.find('img')[0];
    var checked = newTask.find('img')[1];
    if (task.completed) {
        newTask.addClass("done");
        $(todo).hide();
        $(checked).show();
    } else {
        $(todo).show();
        $(checked).hide();
    }
    $('.list').append(newTask);
}


// CREATE TASK FUNCTION
function createTask() {
    var usrInput = $('#todoInput').val();
    $.post("/api/tasks", { name: usrInput })
        .then(function (newTask) {
            $('#todoInput').val("")
            addTask(newTask);

        })
        .catch(function (error) {
            console.log(error);
        })
}



// DELTE TASK FUNCTION
function removeTask(task) {
    var clickedId = task.data('id');

    $.ajax({
        method: "DELETE",
        url: "api/tasks/" + clickedId
    })
        .then(function (data) {
            task.remove();
        })

}



// UPDATE TASK FUNCTION
function updateTask(task) {
    var clickedId = task.data('id');
    var isDone = task.data('completed');
    var updateData = { completed: !isDone };

    $.ajax({
        method: "PUT",
        url: "api/tasks/" + clickedId,
        data: updateData
    })
        .then(function (updatedTask) {
            task.toggleClass("done");
            task.data('completed', !isDone);
            task.find('img').toggle();

        })




}
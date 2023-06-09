'use strict'

function textAreaAdjust(element) {
    element.style.height = "1px";
    element.style.height = (25+element.scrollHeight)+"px";
}



function textAreaAdjustAll() {
    var textareas = document.querySelectorAll(".task__description");
    textareas.forEach(elem => textAreaAdjust(elem));
}

class TaskService {
    getAllTasks() {
        return fetch('/task/getAllTasks')
            .then(response => response.json())
            .then(data => {
                // Обработка полученных данных
                return data;
            })
            .catch(error => {
                console.error('Ошибка при получении данных:', error);
            });
    }

    setAllTasks(tasks) {
        tasks = Array.from(tasks).map((input, index) => ({
            id: 0,
            sortIndex: input.number,
            title: input.title,
            description: input.description,
        }));
        console.log({listFromFrontend: tasks})
        //const jsonData = JSON.stringify({listFromFrontend: tasks});
        const jsonData = JSON.stringify(tasks);

        return fetch('/task/setAllTasks', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: jsonData,
        });
    }
}

class Task{
    #number;
    #title;
    #description;
    #taskNode;
    #numberNode;
    #titleNode;
    #descriptionNode;
    #deleteButtonNode;

    get node() { return this.#taskNode; }

    get number() { return this.#number; }
    set number(value) {
        this.#number = value;
        this.#numberNode.textContent = value;
    }

    get title() { return this.#title; }

    get description() { return this.#description; }
    get deleteButtonNode() { return this.#deleteButtonNode; }

    constructor(number, title, description){
        this.#number = number;
        this.#title = title;
        this.#description = description;
        this.#initNode();
    }

    #initNode() {
        let taskNode = document.createElement('div');
        taskNode.classList.add('task');

        let numberNode = document.createElement('div');
        numberNode.classList.add('task__number');
        numberNode.textContent = this.#number;
        taskNode.append(numberNode);

        let taskContentNode = document.createElement('div');
        taskContentNode.classList.add('task__content');
        taskNode.append(taskContentNode);

        let titleNode = document.createElement('input');
        titleNode.classList.add('task__title');
        titleNode.value = this.#title;
        taskContentNode.append(titleNode);

        let descriptionNode = document.createElement('textarea');
        descriptionNode.classList.add('task__description');
        descriptionNode.textContent = this.#description;
        descriptionNode.setAttribute('onkeyup', 'textAreaAdjust(this)');
        taskContentNode.append(descriptionNode);

        let deleteButtonNode = document.createElement('button');
        deleteButtonNode.classList.add('button');
        deleteButtonNode.textContent = 'Удалить';
        taskNode.append(deleteButtonNode);


        this.#taskNode = taskNode;
        this.#numberNode = numberNode;
        this.#titleNode = titleNode;
        this.#descriptionNode = descriptionNode;
        this.#deleteButtonNode = deleteButtonNode;

        this.#initChangeEvents(taskNode, titleNode, descriptionNode, deleteButtonNode);
    }

    #initChangeEvents(taskNode, titleNode, descriptionNode, deleteButtonNode){
        titleNode.addEventListener('input', (e) => {
            this.#title = e.target.value;
        });
        descriptionNode.addEventListener('input', (e) => {
            this.#description = e.target.value;
        });
    }
}

class TodoList{
    #taskArray;
    #todoListId;

    get maxNumber() {
        return this.#taskArray.length;
    }

    constructor(taskArray, todoListId){
        this.#todoListId = todoListId;
        this.#init(taskArray.sort((a,b) => a.number - b.number));
    }
    #init(taskArray){
        this.#taskArray = [];
        taskArray.forEach(elem => this.addNewTask(elem.title, elem.description) );
        textAreaAdjustAll();
    }
    addNewTask(title, description){
        const taskContainerNode = document.getElementById(this.#todoListId);
        const newTask = new Task(this.maxNumber+1, title, description);
        this.#taskArray.push(newTask);
        taskContainerNode.append(newTask.node);
        newTask.deleteButtonNode.addEventListener('click', (e) => {
            this.deleteTaskByNode(e.target.parentNode);
        });
    }
    deleteTask(task){
        this.#taskArray = this.#taskArray.filter(item => item !== task);
        task.node.remove();
        let i = 1;
        for (const task of this.#taskArray) {
            task.number = i;
            i++;
        }
    }

    deleteTaskByNode(taskNode){
        let task = this.#taskArray.filter(item => item.node === taskNode)[0];
        this.deleteTask(task);
    }

    saveTasks(taskService){
        taskService.setAllTasks(this.#taskArray).then(response =>{
            if (response.ok){
                alert('Данные успешно сохранены');
            }
            else {
                alert('Произошла ошибка, но мы уже работаем над ней!');
            }
        });

    }
}

// let tasks = [
//     new Task(1, 'Записаться к врачу', 'Прийти в кабинет 8 по адресу ул. Пушкина и записаться к врачу'),
//     new Task(2, 'Пройти собеседование', 'Зайти в специальное приложение для собеседования и пройти его'),
//     new Task(3, 'Подготовиться к экзамену', 'Очень интересная мысль меня посетила - подготовиться к экзамену. Но еще много времени для подготовки - до осени'),
// ];

let tasks;

const taskService = new TaskService();
let todoList;
taskService.getAllTasks()
    .then(gettedTasks => {
        tasks = gettedTasks;
    })
    .then(() => {
        todoList = new TodoList(tasks, 'todolist');
    });



document.getElementById('add_new_task_button').addEventListener('click', () => {
    todoList.addNewTask('', '');
});
document.getElementById('save_tasks_button').addEventListener('click', () => {
    todoList.saveTasks(taskService);
});



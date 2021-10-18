import { User, UserType } from "./User";
import { Task, TaskType } from "./Task";

import { fetchData } from "./services";

type DaysToShow = 7 | 10 | 14;

export class Calendar {
  private usersContainer: HTMLElement;
  private backlogContainer: HTMLElement;
  private daysToShow: DaysToShow;
  private daysVisible: string[] = [];

  users: User[];
  tasks: Task[];

  task_dragged: HTMLElement;

  constructor({
    usersDivId,
    backlogDivId,
    daysToShow,
  }: {
    usersDivId: string;
    backlogDivId: string;
    daysToShow?: DaysToShow;
  }) {
    this.usersContainer = document.getElementById(usersDivId);
    this.backlogContainer = document.getElementById(backlogDivId);
    this.setDaysToShow(daysToShow || 7);
    return this;
  }

  mockApi() {
    this.setCalendarDays();
    for (let i = 0; i < 10; i++) {
      this.usersContainer.innerHTML += `
        <div class="user" data-userId>
        <div class="user__data"></div>
        <ul class="user__tasks">
          <li class="task"></li>
          <li class="task"></li>
          <li class="task"></li>
          <li class="task"></li>
          <li class="task"></li>
          <li class="task"></li>
          <li class="task"></li>
        </ul>
      </div>`;
    }
  }

  private insertPreloader(htmlElement: HTMLElement) {
    const node = document.createElement("div");
    node.setAttribute("id", "calendar__preloader");
    node.innerHTML = `
    <div class="lds-dual-ring" id="backlog_list__preloader"></div>`;
    htmlElement.before(node);
  }
  private removePreloader() {
    document.getElementById("calendar__preloader").remove();
  }

  setCalendarDays() {
    const day = 8.64e7,
      today = new Date().getTime();
    const transformDate = (date: number) => {
      return new Date(date).toISOString().split("T")[0];
    };

    const daysArray = [
      transformDate(today - day * 2),
      transformDate(today - day),
      transformDate(today),
    ];
    for (let i = 1; i < this.daysToShow - 2; i++) {
      daysArray.push(transformDate(today + day * i));
    }
    this.daysVisible = daysArray;

    const calendarDayBlocks = document.querySelectorAll(
      ".calendar__header__day"
    );

    for (let i = 0; i < calendarDayBlocks.length; i++) {
      calendarDayBlocks[i].setAttribute("data-day", this.daysVisible[i]);

      calendarDayBlocks[i].innerHTML = this.dateToDayMonth(this.daysVisible[i]);
    }
  }

  dateToDayMonth(string: string) {
    let day = new Date(string).getDate();
    let month = new Date(string).getMonth();

    return `${day < 10 ? "0" + day : day}.${month < 10 ? "0" + month : month}`;
  }

  setDaysToShow(days: DaysToShow) {
    this.daysToShow = days;
  }

  private createDataArray = (array, ClassInstance, storage: string) => {
    const tempArray = [];
    array.forEach((object) => {
      const item = new ClassInstance(object);
      tempArray.push(item);
    });
    this[storage] = tempArray;
  };

  private clearUsersSelectedClass() {
    const users = document.querySelectorAll(".user__data");
    for (let i = 0; i < users.length; i++) {
      users[i].classList.remove("user__data_selected");
    }
  }
  private clearCalendarTasksSelected() {
    const tasks = document.querySelectorAll(".task");
    for (let i = 0; i < tasks.length; i++) {
      tasks[i].classList.remove("task_selected");
    }
  }

  private renderUsers() {
    this.usersContainer.innerHTML = "";
    this.users.forEach(({ data: { id, surname, firstName } }) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");
      userElement.setAttribute("data-userId", id.toString());

      const userData = document.createElement("div");
      userData.classList.add("user__data");
      userData.innerHTML = `${surname} ${firstName}`;
      this.bindUserDataDragover(userData);
      userElement.append(userData);

      const userTasksList = document.createElement("ul");
      userTasksList.classList.add("user__tasks");
      userElement.append(userTasksList);

      this.createUserTasks(userTasksList);
      this.usersContainer.append(userElement);
    });
  }

  bindUserDataDragover(userData) {
    userData.addEventListener("dragover", (event: DragEvent) => {
      const target = event.target as HTMLInputElement;
      document
        .querySelectorAll(".user__data_selected")
        .forEach((element) => element.classList.remove("user__data_selected"));
      target.classList.add("user__data_selected");
    });
  }
  private createUserTasks(userTasksList) {
    for (let i = 0; i < this.daysToShow; i++) {
      const task = document.createElement("li");
      task.classList.add("task");

      task.addEventListener("dragover", (event: DragEvent) => {
        event.preventDefault();

        if (document.querySelector(".backlog__task_selected")) {
          this.clearCalendarTasksSelected();
          const draggedElement = document.querySelector(
            ".backlog__task_selected"
          );

          const draggedElementId = draggedElement.getAttribute("data-taskId");
          const calendarTask = this.createCalendarTaskElement(draggedElementId);

          const currentElement = event.target as HTMLElement;
          if (currentElement.classList.contains("task")) {
            currentElement.classList.add("task_selected");
            this.task_dragged = calendarTask;
          } else if (currentElement.classList.contains("user__data")) {
            currentElement.classList.add("user__data_selected");
            this.task_dragged = calendarTask;
          } else {
            this.task_dragged = null;
          }
        }
      });
      task.addEventListener("dragleave", () => {
        this.clearCalendarTasksSelected();
      });

      userTasksList.append(task);
    }
  }

  private bindTaskToExecutor(task) {}
  private bindTasksToExecutors() {}

  private renderTasks() {
    this.backlogContainer.innerHTML = "";
    this.tasks.forEach(
      ({
        data: {
          id,
          subject,
          creationAuthor,
          creationDate,
          planStartDate,
          planEndDate,
        },
      }) => {
        const infoBlock = `
          <li class=""><span>Автор: </span><span>${creationAuthor}</span></li>
          <li class=""><span>Задача создана: </span><span>${creationDate}</span></li>
          <li class=""><span>Начало: </span><span>${planStartDate}</span></li>
          <li class=""><span>Исполнение к: </span><span>${planEndDate}</span></li>`;
        const taskElement = document.createElement("li");
        taskElement.className = "backlog__task";
        taskElement.setAttribute("data-taskId", id);
        taskElement.innerHTML = `
          <ul class="backlog__task__infoBlock">${infoBlock}</ul>
          <h3 class="backlog__task__subject">${subject}</h3>
          <p class="backlog__task__description">${id}</p>`;

        taskElement.draggable = true;
        taskElement.addEventListener("dragstart", (e) => {
          (<HTMLInputElement>e.target).classList.add("backlog__task_selected");
        });
        taskElement.addEventListener("dragend", (e) => {
          const target = <HTMLInputElement>e.target;

          target.classList.remove("backlog__task_selected");

          let destinataion =
            document.querySelector(".task_selected") ||
            document.querySelector(".user__data_selected");

          if (destinataion.classList.contains("task_selected")) {
            destinataion.append(this.task_dragged);
          } else if (destinataion.classList.contains("user__data_selected")) {
            const userId =
              destinataion.parentElement.getAttribute("data-userId");

            const taskId = this.task_dragged.getAttribute("data-taskId");
            const task = this.tasks.find((task) => task.data.id === taskId);
            const taskDateStart = task.data.planStartDate;

            let calendarDayIndex: number;
            const calendarDays = document.querySelectorAll(
              ".calendar__header__day"
            );

            for (let i = 0; i < calendarDays.length; i++) {
              if (calendarDays[i].getAttribute("data-day") === taskDateStart) {
                calendarDayIndex = i;
                continue;
              }
            }

            const usersTaskList = document
              .querySelector(`.user[data-userId="${userId}"`)
              .querySelectorAll(".task");
            usersTaskList[calendarDayIndex].append(this.task_dragged);
          }
          this.clearCalendarTasksSelected();
          this.clearUsersSelectedClass();
        });

        this.backlogContainer.append(taskElement);
      }
    );
  }

  createCalendarTaskElement(taskOrTaskId: Task | string): HTMLElement {
    const task =
      taskOrTaskId instanceof Task
        ? taskOrTaskId
        : this.tasks.find((item) => item.data.id === taskOrTaskId);

    const draggedElementData = {
      subject: task.data.subject,
      duration:
        (new Date(task.data.planEndDate).getTime() -
          new Date(task.data.planStartDate).getTime()) /
        3600000,
    };

    const taskElement = document.createElement("div");
    taskElement.classList.add("task__element");
    taskElement.setAttribute("data-taskId", task.data.id);
    taskElement.innerHTML = `
      <div class="task__element__title">${draggedElementData.subject}</div>
      <div class="task__element__duration">${
        draggedElementData.duration <= 24
          ? draggedElementData.duration + " часов"
          : draggedElementData.duration / 24 + " дней"
      }<div/>
      `;
    return taskElement;
  }

  async init() {
    this.mockApi();

    fetchData(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users"
    ).then((fetchedUsers: UserType[]) => {
      this.createDataArray(fetchedUsers, User, "users");
      this.renderUsers();
    });

    this.insertPreloader(this.backlogContainer);
    fetchData(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks"
    ).then((fetchedTasks: TaskType[]) => {
      this.createDataArray(fetchedTasks, Task, "tasks");
      this.bindTasksToExecutors();
      this.renderTasks();
      this.removePreloader();
    });

    this.setCalendarDays();
  }
}

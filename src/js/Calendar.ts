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
  week_mode: number = 0;

  constructor({
    usersDivId,
    backlogDivId,
    daysToShow,
    controllers,
  }: {
    usersDivId: string;
    backlogDivId: string;
    daysToShow?: DaysToShow;
    controllers?: {
      prev: string | HTMLElement;
      next: string | HTMLElement;
    };
  }) {
    this.usersContainer = document.getElementById(usersDivId);
    this.backlogContainer = document.getElementById(backlogDivId);
    this.setDaysToShow(daysToShow || 7);
    if (controllers) {
      this.setControllers(controllers);
    }
    this.mockApi();
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

  private transformDate(date: Date | number) {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    } else {
      return new Date(date).toISOString().split("T")[0];
    }
  }

  private setControllers({
    prev,
    next,
  }: {
    prev: string | HTMLElement;
    next: string | HTMLElement;
  }) {
    if (prev instanceof HTMLElement) {
      prev.addEventListener("click", () => {
        this.week_mode--;
        this.init();
      });
    } else {
      const prevButton = document.getElementById(prev);
      prevButton.addEventListener("click", () => {
        this.week_mode--;
        this.init();
      });
    }
    if (next instanceof HTMLElement) {
      next.addEventListener("click", () => {
        this.week_mode++;
        this.init();
      });
    } else {
      const nextButton = document.getElementById(next);
      nextButton.addEventListener("click", () => {
        this.week_mode++;
        this.init();
      });
    }
  }

  setCalendarDays() {
    const dayDuration = 8.64e7,
      weekDuration = dayDuration * 7;
    const todaysDate = new Date().getTime() + this.week_mode * weekDuration;
    const todaysDay =
      new Date(todaysDate).getDay() === 0 ? 7 : new Date(todaysDate).getDay();

    const weekDays: string[] = [];
    for (let i = todaysDay - 1; weekDays.length < this.daysToShow; i--) {
      const day = todaysDate - i * dayDuration;
      const dayToString = this.transformDate(day);
      weekDays.push(dayToString);
    }

    this.daysVisible = weekDays;
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
      task.setAttribute("data-day", this.daysVisible[i]);
      task.classList.add("task");

      task.addEventListener("dragover", (event: DragEvent) => {
        event.preventDefault();

        if (document.querySelector(".backlog__task_selected")) {
          this.clearCalendarTasksSelected();
          const draggedElement = document.querySelector(
            ".backlog__task_selected"
          );

          const draggedElementId = draggedElement.getAttribute("data-taskId");

          const currentElement = event.target as HTMLElement;
          if (currentElement.classList.contains("task")) {
            currentElement.classList.add("task_selected");
          } else if (currentElement.classList.contains("user__data")) {
            currentElement.classList.add("user__data_selected");
          }
          this.task_dragged = this.createCalendarTaskElement(draggedElementId);
        }
      });
      task.addEventListener("dragleave", () => {
        this.clearCalendarTasksSelected();
      });

      userTasksList.append(task);
    }
  }

  private renderTasks() {
    this.backlogContainer.innerHTML = "";
    this.tasks.forEach((task) => {
      const {
        id,
        subject,
        creationAuthor,
        creationDate,
        planStartDate,
        planEndDate,
        executor,
      } = task.data;

      if (!executor) {
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
            // destinataion.append(this.task_dragged);
            const userId = +destinataion
              .closest(".user")
              .getAttribute("data-userId");

            const taskId = this.task_dragged.getAttribute("data-taskId");

            const { planStartDate, planEndDate } = this.tasks.find(
              (item) => item.data.id === taskId
            ).data;
            const duration = new Date(
              new Date(planEndDate).getTime() -
                new Date(planStartDate).getTime()
            ).getTime();

            const factStart = destinataion.getAttribute("data-day");
            const factEnd = this.transformDate(
              new Date(factStart).getTime() + duration
            );

            this.bindCalendarElement({
              element: this.task_dragged,
              executor: userId,
              dayStart: factStart,
              dayEnd: factEnd,
            });
          } else if (destinataion.classList.contains("user__data_selected")) {
            const userId =
              +destinataion.parentElement.getAttribute("data-userId");

            this.bindCalendarElement({
              element: this.task_dragged,
              executor: userId,
              dayStart: planStartDate,
              dayEnd: planEndDate,
            });
          }
          this.clearCalendarTasksSelected();
          this.clearUsersSelectedClass();
          taskElement.remove();
        });

        this.backlogContainer.append(taskElement);
      } else {
        const calendarElement = this.createCalendarTaskElement(task);
        this.bindCalendarElement({
          element: calendarElement,
          executor: executor,
          dayStart: planStartDate,
          dayEnd: planEndDate,
        });
      }
    });
  }

  bindCalendarElement({
    element,
    executor,
    dayStart,
    dayEnd,
  }: {
    element: HTMLElement;
    executor: number;
    dayStart: string;
    dayEnd: string;
  }) {
    const duration =
      (new Date(dayEnd).getTime() - new Date(dayStart).getTime()) / 8.64e7;
    const taskDays: string[] = [];
    for (let i = 0; i < duration; i++) {
      const time = new Date(dayStart).getTime() + i * 8.64e7;
      const day = this.transformDate(time);
      taskDays.push(day);
    }

    const calendarDays = document.querySelectorAll(".calendar__header__day");
    const calendarDaysIndexesToInsert: number[] = [];
    for (let i = 0; i < calendarDays.length; i++) {
      if (taskDays.includes(calendarDays[i].getAttribute("data-day"))) {
        calendarDaysIndexesToInsert.push(i);
      }
    }

    const usersTaskList = document
      .querySelector(`.user[data-userId="${executor}"`)
      .querySelectorAll(".task");
    for (let i = 0; i < usersTaskList.length; i++) {
      if (calendarDaysIndexesToInsert.includes(i)) {
        usersTaskList[i].innerHTML += element.outerHTML;
      }
    }
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
    if (draggedElementData.duration / 24 >= 3) {
      taskElement.classList.add("task__element_green");
    } else if (draggedElementData.duration / 24 >= 2) {
      taskElement.classList.add("task__element_orange");
    } else if (draggedElementData.duration <= 24) {
      taskElement.classList.add("task__element_red");
    }
    return taskElement;
  }

  async init() {
    this.setCalendarDays();
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
      this.renderTasks();
      this.removePreloader();
    });
  }
}

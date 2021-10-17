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
      calendarDayBlocks[i].setAttribute("data_day", this.daysVisible[i]);

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

  private renderUsers() {
    this.usersContainer.innerHTML = "";
    this.users.forEach(({ data: { id, surname, firstName } }) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");
      userElement.setAttribute("data-userId", id.toString());

      let tasks = "";
      for (let i = 0; i < this.daysToShow; i++) {
        tasks += `<li class='task'></li>`;
      }

      userElement.innerHTML = `
        <div class="user__data">${surname} ${firstName}</div>
        <ul class="user__tasks">
          ${tasks}
        </ul>`;
      this.usersContainer.append(userElement);
    });
  }

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
          (<HTMLInputElement>e.target).classList.remove(
            "backlog__task_selected"
          );
        });

        // taskElement.addEventListener("dragover", (e) => {
        //   <HTMLInputElement>e.preventDefault()
        // })

        this.backlogContainer.append(taskElement);
      }
    );
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
      this.renderTasks();
      this.removePreloader();
    });

    this.setCalendarDays();
  }
}

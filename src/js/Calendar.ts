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
    console.log(this.daysVisible);
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
    let tasksStringContent = "";
    this.tasks.forEach(({ data: { id, subject } }) => {
      const taskElement = `
        <li class="backlog__task" data-taskId"=${id}>
          <h3 class="backlog__task__subject">${subject}</h3>
          <p class="backlog__task__description">${id}</p>
        </li>`;
      tasksStringContent += taskElement;
    });
    this.backlogContainer.innerHTML = tasksStringContent;
  }

  async init() {
    fetchData(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users"
    ).then((fetchedUsers: UserType[]) => {
      this.createDataArray(fetchedUsers, User, "users");
      this.renderUsers();
    });

    fetchData(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks"
    ).then((fetchedTasks: TaskType[]) => {
      this.createDataArray(fetchedTasks, Task, "tasks");
      this.renderTasks();
    });

    this.setCalendarDays();
  }
}

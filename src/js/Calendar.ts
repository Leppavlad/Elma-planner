import { User, UserType } from "./User";
import { fetchData } from "./services";

export class Calendar {
  private usersContainer: HTMLElement;
  private backlogContainer: Node;

  users: User[];

  constructor({
    usersDivId,
    backlogDivId,
  }: {
    usersDivId: string;
    backlogDivId: string;
  }) {
    this.usersContainer = document.getElementById(usersDivId);
    this.backlogContainer = document.getElementById(backlogDivId);
  }

  setCalendarDays() {
    const today = new Date().getDate();
  }

  private createUsers = (usersArray: UserType[]) => {
    const usersList = [];
    usersArray.forEach((object) => {
      const userItem = new User(object);
      usersList.push(userItem);
    });
    this.users = usersList;
  };

  private renderUsers() {
    this.users.forEach(({ data: { id, surname, firstName } }) => {
      const userElement = document.createElement("div");
      userElement.classList.add("user");
      userElement.setAttribute("data-userId", id.toString());
      userElement.innerHTML = `
        <div class="user__data">${surname} ${firstName}</div>
        <ul class="user__tasks"></ul>
      `;
      this.usersContainer.append(userElement);
    });
  }

  async init() {
    fetchData(
      "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users"
    ).then((fetchedUsers: UserType[]) => {
      this.createUsers(fetchedUsers);
      this.renderUsers();
    });
  }
}

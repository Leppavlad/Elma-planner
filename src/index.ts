import { Calendar } from "./js/Calendar";

const calendarElma = new Calendar({
  usersDivId: "usersList",
  backlogDivId: "backlogList",
});

calendarElma.init();

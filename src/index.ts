import PerfectScrollbar from "perfect-scrollbar";

import { Calendar } from "./js/Calendar";

new Calendar({
  usersDivId: "usersList",
  backlogDivId: "backlogList",
}).init();

new PerfectScrollbar(document.querySelector(".calendar"));
new PerfectScrollbar(document.querySelector(".backlog__list"));

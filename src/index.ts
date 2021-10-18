import PerfectScrollbar from "perfect-scrollbar";

import { Calendar } from "./js/Calendar";

new Calendar({
  usersDivId: "usersList",
  backlogDivId: "backlogList",
  controllers: {
    prev: "week-prev",
    next: "week-next",
  },
}).init();

new PerfectScrollbar(document.querySelector(".calendar"));
new PerfectScrollbar(document.querySelector(".backlog__list"));

window.addEventListener("DOMContentLoaded", () => {
  function toggleBacklog() {
    const backlog = document.querySelector(".backlog__wrapper");
    if (document.documentElement.clientWidth < 1024) {
      backlog.classList.add("backlog__wrapper_hidden");
    } else {
      backlog.classList.remove("backlog__wrapper_hidden");
    }
  }
  toggleBacklog();
  window.addEventListener("resize", toggleBacklog);
});

var page = new tabris.Page({
  title: "Web Storage",
  topLevel: true
});

var KEY = "localStorageSnippetCount";

var startCount = parseInt(localStorage.getItem(KEY) || "0") + 1;
localStorage.setItem(KEY, startCount.toString());
new tabris.TextView({
  layoutData: {left: 10, right: 10, centerY: 0},
  alignment: "center",
  font: "22px sans-serif",
  text: "This application was started " + startCount + " time(s)."
}).appendTo(page);

page.open();

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Local Storage",
    topLevel: true
  });

  var KEY = "localStorageSnippetCount";

  var startCount = parseInt(localStorage.getItem(KEY) || "0") + 1;
  localStorage.setItem(KEY, startCount.toString());
  tabris.create("Label", {
    layoutData: {left: 10, right: 10, centerY: 0},
    alignment: "center",
    font: "22px sans-serif",
    text: "This application was started " + startCount + " time(s)."
  }).appendTo(page);

  page.open();

});

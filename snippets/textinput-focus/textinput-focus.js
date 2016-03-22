var page = new tabris.Page({
  title: "Text Input / Focus Listener",
  topLevel: true
});

new tabris.TextInput({
  layoutData: {top: 20, left: "20%", right: "20%"},
  message: "Colorful typing...",
  font: "22px sans-serif"
}).on("focus", function() {
  this.set("background", "yellow");
}).on("blur", function() {
  this.set("background", "red");
}).appendTo(page);

new tabris.TextInput({
  layoutData: {top: "prev() 20", left: "20%", right: "20%"},
  message: "Another field to focus..."
}).appendTo(page);

page.open();

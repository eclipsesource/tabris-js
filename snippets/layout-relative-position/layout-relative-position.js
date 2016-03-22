var page = new tabris.Page({
  title: "Layout - Relative Positioning",
  topLevel: true
}).open();

var redbox = new tabris.Composite({
  layoutData: {left: 10, top: 10, width: 100, height: 100},
  background: "red"
}).appendTo(page);

// you can refer to a sibling widget by reference ...

new tabris.Composite({
  id: "bluebox",
  layoutData: {left: [redbox, 10], top: [redbox, 10], width: 100, height: 100},
  background: "blue"
}).appendTo(page);

// ... by id ...

new tabris.Composite({
  layoutData: {left: "#bluebox 10", top: "#bluebox 10", width: 100, height: 100},
  background: "green"
}).appendTo(page);

// ... or by a symbolic reference to the preceeding sibling

new tabris.Composite({
  layoutData: {left: "prev() 10", top: "prev() 10", width: 100, height: 100},
  background: "yellow"
}).appendTo(page);

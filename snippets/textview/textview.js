var page = new tabris.Page({
  title: "TextView",
  topLevel: true
});

new tabris.TextView({
  layoutData: {left: 10, top: 10, right: 10},
  text: "Left",
  alignment: "left"
}).appendTo(page);

new tabris.TextView({
  layoutData: {left: 10, top: "prev() 10", right: 10},
  text: "Center",
  alignment: "center"
}).appendTo(page);

new tabris.TextView({
  layoutData: {left: 10, top: "prev() 10", right: 10},
  text: "Right",
  alignment: "right"
}).appendTo(page);

page.open();

var page = tabris.create("Page", {
  title: "TextView - Markup",
  topLevel: true
});

var markup = "<b>bold</b>, <i>italic</i>, <big>big</big>, <small>small</small>, " +
             "<ins>ins</ins>, <del>del</del>, <a>link</a>";

tabris.create("TextView", {
  layoutData: {left: 10, top: 10, right: 10},
  text: "TextView with markup not enabled:\n" + markup
}).appendTo(page);

tabris.create("TextView", {
  layoutData: {left: 10, top: "prev() 30", right: 10},
  text: "TextView with markup enabled:\n" + markup,
  markupEnabled: true
}).appendTo(page);

page.open();

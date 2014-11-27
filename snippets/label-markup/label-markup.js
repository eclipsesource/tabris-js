tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Label - Markup",
    topLevel: true
  });

  var markup = "<b>bold</b>, <i>italic</i>, <big>big</big>, <small>small</small>, " +
               "<ins>ins</ins>, <del>del</del>, <a>link</a>";

  tabris.create("Label", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Label with markup not enabled:\n" + markup
  }).appendTo(page);

  tabris.create("Label", {
    layoutData: {left: 10, top: [page.children().pop(), 30], right: 10},
    text: "Label with markup enabled:\n" + markup,
    markupEnabled: true
  }).appendTo(page);

  page.open();

});

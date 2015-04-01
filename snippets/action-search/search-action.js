var page = tabris.create("Page", {
  title: "Actions",
  topLevel: true
});

var proposals = ["baseball", "batman", "battleship", "bangkok", "bangladesh", "banana"];

var textView = tabris.create("TextView", {
  layoutData: {centerX: 0, centerY: 0}
}).appendTo(page);

tabris.create("SearchAction", {
  title: "Search",
  image: "images/search.png"
}).on("modify", function(widget, event) {
  this.set("proposals", proposals.filter(function(proposal) {
    return proposal.indexOf(event.query) !== -1;
  }));
}).on("submit", function(widget, event) {
  textView.set("text", "Selected '" + event.query + "'");
});

page.open();

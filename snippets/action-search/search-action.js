var page = tabris.create("Page", {
  title: "Actions",
  topLevel: true
});

var proposals = ["baseball", "batman", "battleship", "bangkok", "bangladesh", "banana"];

var label = tabris.create("Label", {
  layoutData: {centerX: 0, centerY: 0}
}).appendTo(page);

tabris.create("SearchAction", {
  title: "Search",
  image: "images/search.png"
}).on("modify", function(event) {
  this.set("proposals", proposals.filter(function(proposal) {
    return proposal.indexOf(event.query) !== -1;
  }));
}).on("submit", function(event) {
  label.set("text", "Selected '" + event.query + "'");
});

page.open();

var page = tabris.create("Page", {
  title: "Actions",
  topLevel: true
});

var proposals = ["baseball", "batman", "battleship", "bangkok", "bangladesh", "banana"];

var textView = tabris.create("TextView", {
  layoutData: {centerX: 0, centerY: 0}
}).appendTo(page);

var action = tabris.create("SearchAction", {
  title: "Search",
  image: "images/search.png"
}).on("select", function() {
  this.set("text", "");
}).on("input", function(widget, query) {
  updateProposals(query);
}).on("accept", function(widget, query) {
  textView.set("text", "Selected '" + query + "'");
});

updateProposals("");

page.open();

function updateProposals(query) {
  action.set("proposals", proposals.filter(function(proposal) {
    return proposal.indexOf(query.toLowerCase()) !== -1;
  }));
}

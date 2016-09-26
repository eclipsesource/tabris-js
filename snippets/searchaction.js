var page = new tabris.Page({
  title: "Actions",
  topLevel: true
});

var proposals = ["baseball", "batman", "battleship", "bangkok", "bangladesh", "banana"];

var searchBox = new tabris.Composite({
  layoutData: {centerX: 0, centerY: 0}
}).appendTo(page);

var textView = new tabris.TextView().appendTo(searchBox);

var action = new tabris.SearchAction({
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

new tabris.Button({
  text: "Open Search",
  centerX: 0,
  top: "prev() 10"
}).on("select", function() {
  action.open();
}).appendTo(searchBox);

page.open();

function updateProposals(query) {
  action.set("proposals", proposals.filter(function(proposal) {
    return proposal.indexOf(query.toLowerCase()) !== -1;
  }));
}

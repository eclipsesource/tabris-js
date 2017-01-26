// Create an action on NavigationView to perform a search with dynamic proposals

var PROPOSALS = ['baseball', 'batman', 'battleship', 'bangkok', 'bangladesh', 'banana'];

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var page = new tabris.Page({
  title: 'Search action'
}).appendTo(navigationView);

var searchBox = new tabris.Composite({
  centerX: 0, centerY: 0
}).appendTo(page);

var textView = new tabris.TextView().appendTo(searchBox);

var action = new tabris.SearchAction({
  title: 'Search',
  image: 'images/search.png'
}).on('select', function() {
  this.text = '';
}).on('input', function(widget, query) {
  updateProposals(query);
}).on('accept', function(widget, query) {
  textView.text = 'Selected "' + query + '"';
}).appendTo(navigationView);

updateProposals('');

new tabris.Button({
  text: 'Open Search',
  centerX: 0,
  top: 'prev() 10'
}).on('select', function() {
  action.open();
}).appendTo(searchBox);

function updateProposals(query) {
  action.proposals = PROPOSALS.filter(function(proposal) {
    return proposal.indexOf(query.toLowerCase()) !== -1;
  });
}

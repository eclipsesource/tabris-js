const {Button, Composite, NavigationView, Page, SearchAction, TextView, ui} = require('tabris');

// Create an action on NavigationView to perform a search with dynamic proposals

const PROPOSALS = ['baseball', 'batman', 'battleship', 'bangkok', 'bangladesh', 'banana'];

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

let page = new Page({
  title: 'Search action'
}).appendTo(navigationView);

let searchBox = new Composite({
  centerX: 0, centerY: 0
}).appendTo(page);

let textView = new TextView().appendTo(searchBox);

let action = new SearchAction({
  title: 'Search',
  image: {
    src: device.platform === 'iOS' ? 'resources/search-black-24dp@3x.png' : 'resources/search-white-24dp@3x.png',
    scale: 3
  }
}).on('select', ({target}) => target.text = '')
  .on('input', ({text}) => updateProposals(text))
  .on('accept', ({text}) => textView.text = 'Selected "' + text + '"')
  .appendTo(navigationView);

updateProposals('');

new Button({
  text: 'Open Search',
  centerX: 0,
  top: 'prev() 10'
}).on('select', () => action.open())
  .appendTo(searchBox);

function updateProposals(query) {
  action.proposals = PROPOSALS.filter(proposal => proposal.indexOf(query.toLowerCase()) !== -1);
}

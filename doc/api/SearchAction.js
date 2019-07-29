import {SearchAction, NavigationView, contentView} from 'tabris';

const items = ['apple', 'banana', 'cherry'];

const navigationView = new NavigationView({layoutData: 'stretch'})
  .appendTo(contentView);

new SearchAction({title: 'Search', image: 'resources/search.png'})
  .onInput(event => items.filter(proposal => proposal.indexOf(event.query) !== -1))
  .onAccept(event => console.log(`Showing content for ${event.text}`))
  .appendTo(navigationView);

import {contentView, Picker} from 'tabris';

const items = ['Apple', 'Banana', 'Cherry'];

new Picker({
  itemCount: items.length,
  itemText: index => items[index]
}).onSelect(event => console.log(`Selected ${items[event.index]}`))
  .appendTo(contentView);

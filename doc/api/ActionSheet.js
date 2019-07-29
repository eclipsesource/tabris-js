import {ActionSheet} from 'tabris';

new ActionSheet({
  title: 'ActionSheet',
  actions: [{title: 'Save'}, {title: 'Delete', style: 'destructive'}]
}).onSelect(({index}) => console.log(`Selected ${index}`))
  .open();

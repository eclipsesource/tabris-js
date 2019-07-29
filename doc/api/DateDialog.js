import {DateDialog} from 'tabris';

new DateDialog()
  .onSelect(({date}) => console.log(`Selected ${date}`))
  .open();

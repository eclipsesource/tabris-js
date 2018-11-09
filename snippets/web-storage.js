import {TextView, ui} from 'tabris';

const KEY = 'localStorageSnippetCount';

const startCount = parseInt(localStorage.getItem(KEY) || '0', 10) + 1;
localStorage.setItem(KEY, startCount.toString());
new TextView({
  left: 10, right: 10, centerY: 0,
  alignment: 'center',
  font: '22px sans-serif',
  text: 'This application was started ' + startCount + ' time(s).'
}).appendTo(ui.contentView);

// Tabris.js implements a subset of the W3C Web Storage Recommendation.
// See https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

import {Button, TextInput, TextView, ui, localStorage} from 'tabris';

const KEY = 'snippet-value';

let valueLabel = new TextView({
  left: 32, top: 32,
  text: 'Value:'
}).appendTo(ui.contentView);

let valueField = new TextInput({
  left: 'prev() 12', baseline: valueLabel, right: 32,
  text: localStorage.getItem(KEY) || 'Hello world!'
}).appendTo(ui.contentView);

new Button({
  left: 24, right: '66%', top: [valueLabel, 24],
  text: 'Set'
}).on('select', () => {
  localStorage.setItem(KEY, valueField.text);
  valueField.text = '';
}).appendTo(ui.contentView);

new Button({
  left: '33% 12', right: '33% 12', top: [valueLabel, 24],
  text: 'Get'
}).on('select', () => {
  valueField.text = localStorage.getItem(KEY) || '';
}).appendTo(ui.contentView);

new Button({
  left: '66%', right: 24, top: [valueLabel, 24],
  text: 'Remove'
}).on('select', () => {
  localStorage.removeItem(KEY);
  valueField.text = '';
}).appendTo(ui.contentView);

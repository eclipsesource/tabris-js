import {TextView, crypto, ui} from 'tabris';

const buffer = new Uint8Array(24);
crypto.getRandomValues(buffer);

new TextView({
  left: 16, right: 16, top: 16,
  font: '16px monospace',
  text: join(buffer)
}).appendTo(ui.contentView);

function join(arr) {
  // TypedArray.join not supported on iOS
  return Array.prototype.join.call(arr, ' ');
}

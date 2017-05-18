const {TextView, crypto, ui} = require('tabris');

let buffer = new Uint8Array(24);
crypto.getRandomValues(buffer);

new TextView({
  left: 16, right: 16, top: 16,
  font: '16px monospace',
  text: join(buffer)
}).appendTo(ui.contentView);

function join(buffer) {
  // TypedArray.join not supported on iOS
  return Array.prototype.join.call(buffer, ' ');
}

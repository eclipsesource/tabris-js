var buffer = new Uint8Array(24);
tabris.crypto.getRandomValues(buffer);

new tabris.TextView({
  left: 16, right: 16, top: 16,
  font: '16px monospace',
  text: join(buffer)
}).appendTo(tabris.ui.contentView);

function join(buffer) {
  // TypedArray.join not supported on iOS
  return Array.prototype.join.call(buffer, ' ');
}

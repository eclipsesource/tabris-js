
var keyTextView = new tabris.TextView({
  left: 10, top: 20,
  text: 'Key:'
}).appendTo(tabris.ui.contentView);

var keyField = new tabris.TextInput({
  left: 60, baseline: keyTextView, right: 10,
  text: 'foo'
}).appendTo(tabris.ui.contentView);

var valueTextView = new tabris.TextView({
  left: 10, top: [keyField, 20],
  text: 'Value:'
}).appendTo(tabris.ui.contentView);

var valueField = new tabris.TextInput({
  left: 60, baseline: valueTextView, right: 10,
  text: localStorage.getItem('foo') || 'bar'
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: 10, right: '66% 5', top: [valueTextView, 20],
  text: 'Set'
}).on('select', function() {
  if (!keyField.text) {
    console.error('The key cannot be empty.');
  } else if (!valueField.text) {
    console.error('The value cannot be empty.');
  } else {
    localStorage.setItem(keyField.text, valueField.text);
    valueField.text = '';
  }
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: '33% 5', right: '33% 5', top: [valueTextView, 20],
  text: 'Get'
}).on('select', function() {
  if (!keyField.text) {
    console.error('The key cannot be empty.');
  } else {
    valueField.text = '';
    valueField.text = localStorage.getItem(keyField.text);
  }
}).appendTo(tabris.ui.contentView);

new tabris.Button({
  left: '66% 5', right: 10, top: [valueTextView, 20],
  text: 'Remove'
}).on('select', function() {
  localStorage.removeItem(keyField.text);
  valueField.text = '';
}).appendTo(tabris.ui.contentView);

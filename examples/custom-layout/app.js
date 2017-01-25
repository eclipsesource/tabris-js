var RowLayout = require('./RowLayout');

var composite = new tabris.Composite({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var count = 1;
new tabris.Button({
  text: 'Add Button'
}).on('select', function() {
  return new tabris.Button({
    text: 'Button ' + count++ + ' (remove)'
  }).on('select', function() {
    this.dispose();
  }).appendTo(composite);
}).appendTo(composite);

new RowLayout({
  margin: 20, spacing: 10
}).attachTo(composite)
  .layout();

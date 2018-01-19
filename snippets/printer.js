const {Button, printer, ui, app} = require('tabris');

// Print a bundled PDF

new Button({
  left: 16, right: 16, top: 16,
  text: 'Print PDF'
}).on('select', () => {
  fetch(app.getResourceLocation('resources/example.pdf'))
    .then(res => res.arrayBuffer())
    .then(data => printer.print(data, {jobName: 'tabris print example'}))
    .then(event => console.log('Printing finished', event))
    .catch(err => console.error(err));
}).appendTo(ui.contentView);

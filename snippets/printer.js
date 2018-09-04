import {Button, printer, ui, app} from 'tabris';

// Print a bundled PDF

new Button({
  left: 16, right: 16, top: 16,
  text: 'Print PDF'
}).on('select', () => print('resources/example.pdf', 'application/pdf', 'Example PDF'))
  .appendTo(ui.contentView);

new Button({
  left: 16, right: 16, top: 'prev() 16',
  text: 'Print Image'
}).on('select', () => print('resources/salad.jpg', 'image/jpg', 'Salad image'))
  .appendTo(ui.contentView);

function print(file, contentType, jobName) {
  fetch(app.getResourceLocation(file))
    .then(res => res.arrayBuffer())
    .then(data => printer.print(data, {jobName, contentType}))
    .then(event => console.log('Printing finished', event))
    .catch(err => console.error(err));
}

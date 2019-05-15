import {Button, printer, contentView, app} from 'tabris';

// Print a bundled PDF

new Button({
  left: 16, right: 16, top: 16,
  text: 'Print PDF'
}).onSelect(() => print('resources/example.pdf', 'application/pdf', 'Example PDF'))
  .appendTo(contentView);

new Button({
  left: 16, right: 16, top: 'prev() 16',
  text: 'Print Image'
}).onSelect(() => print('resources/salad.jpg', 'image/jpg', 'Salad image'))
  .appendTo(contentView);

function print(file, contentType, jobName) {
  fetch(app.getResourceLocation(file))
    .then(res => res.arrayBuffer())
    .then(data => printer.print(data, {jobName, contentType}))
    .then(event => console.log('Printing finished', event))
    .catch(err => console.error(err));
}

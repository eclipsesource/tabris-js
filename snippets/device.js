const {TextView, device, ui} = require('tabris');

// Display available device information

['platform', 'version', 'model', 'vendor', 'name', 'language', 'orientation'].forEach((property) => {
  new TextView({
    id: property,
    left: 10, right: 10, top: 'prev() 10',
    text: property + ': ' + device[property]
  }).appendTo(ui.contentView);
});

device.on('orientationChanged', ({value: orientation}) => {
  ui.contentView.find('#orientation').set('text', 'orientation: ' + orientation);
});

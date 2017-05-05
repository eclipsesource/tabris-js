// Display available device information

['platform', 'version', 'model', 'language', 'orientation'].forEach(function(property) {
  new tabris.TextView({
    id: property,
    left: 10, right: 10, top: 'prev() 10',
    text: property + ': ' + tabris.device[property]
  }).appendTo(tabris.ui.contentView);
});

tabris.device.on('orientationChanged', function({value: orientation}) {
  tabris.ui.contentView.find('#orientation').text = 'orientation: ' + orientation;
});

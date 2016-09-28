var PluginPage = require('./PluginPage');

var page = new PluginPage('BarcodeScanner', 'cordova-plugin-barcodescanner', function(parent) {

  new tabris.Button({
    layoutData: {left: 10, top: 10, right: 10},
    text: 'Scan Barcode'
  }).on('select', scanBarcode).appendTo(parent);

  var resultView = new tabris.TextView({
    layoutData: {top: 'prev() 20', left: 20, right: 20},
    markupEnabled: true
  }).appendTo(parent);

  function scanBarcode() {
    cordova.plugins.barcodeScanner.scan(function(result) {
      resultView.set('text', result.cancelled ?
                             '<b>Scan cancelled</b>' :
                             '<b>Scan result:</b> ' + result.text + ' (' + result.format + ')');
    }, function(error) {
      resultView.set('text', '<b>Error:</b> ' + error);
    });
  }
});

module.exports = page;

const PluginPage = require('./PluginPage');
const {Button, TextView} = require('tabris');

const TITLE = 'BarcodeScanner';
const PLUGIN_ID = 'phonegap-plugin-barcodescanner';
const SCAN_BARCODE_BUTTON_TEXT = 'Scan Barcode';

module.exports = class BarcodeScannerPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({id: 'scanBarcodeButton', text: SCAN_BARCODE_BUTTON_TEXT})
        .on('select', () => this._scanBarcode()),
      new TextView({id: 'resultDisplay', markupEnabled: true})
    );
  }

  _scanBarcode() {
    let resultDisplay = this.find('#resultDisplay').first();
    let onSuccess = (result) => {
      resultDisplay.text = result.cancelled ?
        '<b>Scan cancelled</b>' :
        '<b>Scan result:</b> ' + result.text + ' (' + result.format + ')';
    };
    let onError = error => resultDisplay.text = '<b>Error:</b> ' + error;
    cordova.plugins.barcodeScanner.scan(onSuccess, onError);
  }

  applyLayout() {
    super.applyLayout();
    this.content.apply({
      '#scanBarcodeButton': {left: 16, top: 8, right: 16},
      '#resultDisplay': {top: 'prev() 16', left: 16, right: 16}
    });
  }

};

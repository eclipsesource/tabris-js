const PluginPage = require('./PluginPage');
const {Button, TextView} = require('tabris');

const TITLE = 'Network';
const PLUGIN_ID = 'cordova-plugin-network-information';
const GET_NETWORK_STATE_BUTTON_TEXT = 'Get Network State';
const NETWORK_STATES = {
  [window.Connection.UNKNOWN]  : 'Unknown connection',
  [window.Connection.ETHERNET] : 'Ethernet connection',
  [window.Connection.WIFI]     : 'WiFi connection',
  [window.Connection.CELL_2G]  : 'Cell 2G connection',
  [window.Connection.CELL_3G]  : 'Cell 3G connection',
  [window.Connection.CELL_4G]  : 'Cell 4G connection',
  [window.Connection.CELL]     : 'Cell generic connection',
  [window.Connection.NONE]     : 'No network connection'
};

module.exports = class NetworkPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({id: 'getNetworkStateButton', text: GET_NETWORK_STATE_BUTTON_TEXT})
        .on('select', () => this._showNetworkState()),
      new TextView({id: 'networkStateDisplay'})
    );
  }

  _showNetworkState() {
    const state = navigator.connection.type;
    this.find('#networkStateDisplay').first().text = NETWORK_STATES[state];
  }

  applyLayout() {
    super.applyLayout();
    this.content.apply({
      '#getNetworkStateButton': {left: 16, top: 8, right: 16},
      '#networkStateDisplay': {top: 'prev() 16', left: 16, right: 16}
    });
  }
};

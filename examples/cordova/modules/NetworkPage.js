var PluginPage = require('./PluginPage');

var page = new PluginPage('Network', 'cordova-plugin-network-information', function(parent) {

  var states = {};
  states[window.Connection.UNKNOWN]  = 'Unknown connection';
  states[window.Connection.ETHERNET] = 'Ethernet connection';
  states[window.Connection.WIFI]     = 'WiFi connection';
  states[window.Connection.CELL_2G]  = 'Cell 2G connection';
  states[window.Connection.CELL_3G]  = 'Cell 3G connection';
  states[window.Connection.CELL_4G]  = 'Cell 4G connection';
  states[window.Connection.CELL]     = 'Cell generic connection';
  states[window.Connection.NONE]     = 'No network connection';

  var button = new tabris.Button({
    left: 10, top: 10, right: 10,
    text: 'Get Network State'
  }).appendTo(parent).on('select', function() {
    var networkState = navigator.connection.type;
    textView.text = states[networkState];
  });

  var textView = new tabris.TextView({
    top: [button, 20], left: 20, right: 20
  }).appendTo(parent);
});

module.exports = page;

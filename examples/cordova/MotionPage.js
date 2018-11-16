const PluginPage = require('./PluginPage');

const {Button, TextView} = require('tabris');

const TITLE = 'Motion';
const PLUGIN_ID = 'cordova-plugin-device-motion';
const START_WATCH_BUTTON_TEXT = 'Start Watch Acceleration';
const STOP_WATCH_BUTTON_TEXT = 'Stop Watch Acceleration';

module.exports = class MotionPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({id: 'startWatchButton', text: START_WATCH_BUTTON_TEXT})
        .on('select', () => this._startAccelerationWatch()),
      new Button({id: 'stopWatchButton', text: STOP_WATCH_BUTTON_TEXT})
        .on('select', () => this._stopAccelerationWatch()),
      new TextView({id: 'accelerationDisplay'})
    );
  }

  _startAccelerationWatch() {
    const onSuccess = acceleration =>
      this.find('#accelerationDisplay').set({text: this._accelerationToString(acceleration)});
    const onError = () => console.log('onError!');
    const options = {frequency: 700};  // Update every 700ms
    this._watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);
  }

  _stopAccelerationWatch() {
    navigator.accelerometer.clearWatch(this._watchID);
  }

  _accelerationToString(acceleration) {
    const string =
`Acceleration X: ${acceleration.x}
Acceleration Y: ${acceleration.y}
Acceleration Z: ${acceleration.z}
Timestamp: ${acceleration.timestamp}`;
    return string;
  }

  applyLayout() {
    super.applyLayout();
    this.content.apply({
      '#startWatchButton': {left: 16, top: 8, right: 16},
      '#stopWatchButton': {left: 16, top: 'prev() 8', right: 16},
      '#accelerationDisplay': {top: '#stopWatchButton 16', left: 16, right: 16}
    });
  }

};

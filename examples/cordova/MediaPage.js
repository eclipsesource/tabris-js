/* global Media: false */

const PluginPage = require('./PluginPage');
const {Button} = require('tabris');

const TITLE = 'Media';
const PLUGIN_ID = 'cordova-media';
const PLAY_BUTTON_TEXT = 'Play';

module.exports = class MediaPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
    this._media = this._createMedia();
    this.on('disappear', () => {
      this._media.stop();
      this._media.release();
    });
  }

  _createMedia() {
    let path = tabris.app.getResourceLocation('audio/media.wav');
    // According to Media plugin documentation the media path must be
    // relative to the "www" folder under iOS
    if (tabris.device.platform === 'iOS') {
      path = path.substr(path.indexOf('/www/') + 5);
    }
    const onSuccess = () => console.log('Audio file loaded successfully');
    const onError = err => console.log('Unable to play audio file: ' + err.code + ' - ' + err.message);
    return new Media(path, onSuccess, onError);
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({id: 'playButton', text: PLAY_BUTTON_TEXT})
        .on('select', () => this._media.play())
    );
  }

  applyLayout() {
    super.applyLayout();
    this.content.apply({
      '#playButton': {left: 16, top: 8, right: 16}
    });
  }

};

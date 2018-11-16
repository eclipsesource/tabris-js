const PluginPage = require('./PluginPage');
const {Button, ImageView} = require('tabris');

const TITLE = 'Camera';
const PLUGIN_ID = 'cordova-plugin-camera';
const PICTURE_BUTTON_TEXT = 'Take a picture';

module.exports = class CameraPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({id: 'pictureButton', text: PICTURE_BUTTON_TEXT})
        .on('select', () => this._takePicture()),
      new ImageView({id: 'image'})
    );
  }

  _takePicture() {
    const onSuccess = image => this.find('#image').first().image = image;
    const onFail = message => console.log('Camera failed because: ' + message);
    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,
      targetWidth: 1024,
      targetHeight: 1024,
      destinationType: window.Camera.DestinationType.FILE_URI
    });
  }

  applyLayout() {
    super.applyLayout();
    this.content.apply({
      '#pictureButton': {left: 16, top: 8, right: 16},
      '#image': {top: '#pictureButton 16', left: 16, right: 16, bottom: 16}
    });
  }

};

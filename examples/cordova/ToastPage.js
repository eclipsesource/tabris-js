const PluginPage = require('./PluginPage');
const {Button, TextInput} = require('tabris');

const TITLE = 'Toast';
const PLUGIN_ID = 'cordova-plugin-x-toast';
const YOUR_MESSAGE = 'your message';
const SHOW_SHORT_TOP = 'Show short top';
const SHOW_SHORT_CENTER = 'Show short center';
const SHOW_SHORT_BOTTOM = 'Show short bottom';
const SHOW_LONG_TOP = 'Show long top';
const SHOW_LONG_CENTER = 'Show long center';
const SHOW_LONG_BOTTOM = 'Show long bottom';

module.exports = class ToastPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      this._input = new TextInput({message: YOUR_MESSAGE}),
      new Button({text: SHOW_SHORT_TOP})
        .on('select', () => window.plugins.toast.showShortTop(this._input.text)),
      new Button({text: SHOW_SHORT_CENTER})
        .on('select', () => window.plugins.toast.showShortCenter(this._input.text)),
      new Button({text: SHOW_SHORT_BOTTOM})
        .on('select', () => window.plugins.toast.showShortBottom(this._input.text)),
      new Button({text: SHOW_LONG_TOP})
        .on('select', () => window.plugins.toast.showLongTop(this._input.text)),
      new Button({text: SHOW_LONG_CENTER})
        .on('select', () => window.plugins.toast.showLongCenter(this._input.text)),
      new Button({text: SHOW_LONG_BOTTOM})
        .on('select', () => window.plugins.toast.showLongBottom(this._input.text))
    );
  }

  applyLayout() {
    super.applyLayout();
    this.content.children().forEach(child => child.set({left: 16, top: 'prev() 8', right: 16}));
  }

};

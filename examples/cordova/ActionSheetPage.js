const PluginPage = require('./PluginPage');
const {Button} = require('tabris');

/********************
 * More info at:
 * https://github.com/EddyVerbruggen/cordova-plugin-actionsheet
 *******************/

const TITLE = 'ActionSheet';
const PLUGIN_ID = 'cordova-plugin-actionsheet';
const SHARE_SHEET_BUTTON_TEXT = 'Share menu';
const DELETE_SHEET_BUTTON_TEXT = 'Delete menu';
const LOGOUT_SHEET_BUTTON_TEXT = 'Logout menu';

module.exports = class ActionSheetPage extends PluginPage {

  constructor(properties) {
    super(Object.assign({pluginId: PLUGIN_ID, title: TITLE}, properties));
  }

  createUI() {
    super.createUI();
    this.content.append(
      new Button({text: SHARE_SHEET_BUTTON_TEXT})
        .on('select', () => this._showShareSheet()),
      new Button({text: DELETE_SHEET_BUTTON_TEXT})
        .on('select', () => this._showDeleteSheet()),
      new Button({text: LOGOUT_SHEET_BUTTON_TEXT})
        .on('select', () => this._showLogoutSheet())
    );
  }

  _showShareSheet() {
    let options = {
      androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
      title: 'What do you want with this image?',
      buttonLabels: ['Share via Facebook', 'Share via Twitter'],
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true,
      addCancelButtonWithLabel: 'Cancel',
      addDestructiveButtonWithLabel: 'Delete it'
    };
    window.plugins.actionsheet.show(options, index => this._handleButtonSelect(index));
  }

  _showDeleteSheet() {
    let options = {
      addCancelButtonWithLabel: 'Cancel',
      addDestructiveButtonWithLabel: 'Delete note'
    };
    window.plugins.actionsheet.show(options, index => this._handleButtonSelect(index));
  }

  _showLogoutSheet() {
    let options = {
      buttonLabels: ['Log out'],
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true,
      addCancelButtonWithLabel: 'Cancel'
    };
    window.plugins.actionsheet.show(options, index => this._handleButtonSelect(index));
  }

  _handleButtonSelect(index) {
    setTimeout(() => {
      // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
      console.log('button index clicked: ' + index);
      window.plugins.toast.showShortCenter('button index clicked: ' + index);
    });
  }

  applyLayout() {
    super.applyLayout();
    this.content.children().forEach(child => child.set({left: 16, top: 'prev() 8', right: 16}));
  }

};

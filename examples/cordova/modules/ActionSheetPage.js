var PluginPage = require('./PluginPage');

/********************
 * More info at:
 * https://github.com/EddyVerbruggen/cordova-plugin-actionsheet
 *******************/

var page = new PluginPage('ActionSheet', 'cordova-plugin-actionsheet', function(parent) {

  var buttons = [
    {
      title: 'Sharing menu',
      handler: shareSheet
    },
    {
      title: 'Delete menu',
      handler: deleteSheet
    },
    {
      title: 'Log out menu',
      handler: logoutSheet
    }
  ];

  buttons.forEach(function(option) {
    new tabris.Button({
      left: 10, top: ['prev()', 10], right: 10,
      text: option.title
    }).appendTo(parent).on('select', option.handler);
  });

});

module.exports = page;

var callback = function(buttonIndex) {
  setTimeout(function() {
    // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
    console.log('button index clicked: ' + buttonIndex);
    window.plugins.toast.showShortCenter('button index clicked: ' + buttonIndex);
  });
};

function shareSheet() {
  var options = {
    androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
    title: 'What do you want with this image?',
    buttonLabels: ['Share via Facebook', 'Share via Twitter'],
    androidEnableCancelButton: true,
    winphoneEnableCancelButton: true,
    addCancelButtonWithLabel: 'Cancel',
    addDestructiveButtonWithLabel: 'Delete it'
  };
  window.plugins.actionsheet.show(options, callback);
}

function deleteSheet() {
  var options = {
    addCancelButtonWithLabel: 'Cancel',
    addDestructiveButtonWithLabel: 'Delete note'
  };
  window.plugins.actionsheet.show(options, callback);
}

function logoutSheet() {
  var options = {
    buttonLabels: ['Log out'],
    androidEnableCancelButton: true,
    winphoneEnableCancelButton: true,
    addCancelButtonWithLabel: 'Cancel'
  };
  window.plugins.actionsheet.show(options, callback);
}

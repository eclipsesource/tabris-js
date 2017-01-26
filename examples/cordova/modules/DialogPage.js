var PluginPage = require('./PluginPage');

var page = new PluginPage('Dialog', 'cordova-plugin-dialogs', function(parent) {

  var buttonAlert = new tabris.Button({
    left: 10, top: 10, right: 10,
    text: 'Show Alert Dialog'
  }).appendTo(parent).on('select', function() {
    navigator.notification.alert(
      'You are the winner!', // message
      function() {
        textView.text = 'Alert closed';
      }, // callback
      'Game Over', // title
      'Done' // buttonName
    );
  });

  var buttonConfirm = new tabris.Button({
    left: 10, top: [buttonAlert, 10], right: 10,
    text: 'Show Confirm Dialog'
  }).appendTo(parent).on('select', function() {
    navigator.notification.confirm(
        'You are the winner!', // message
         function(buttonIndex) {
           textView.text = 'Confirm closed with code: ' + buttonIndex;
         }, // callback to invoke with index of button pressed
        'Game Over', // title
        ['Restart', 'Exit'] // buttonTextViews
    );
  });

  var buttonPrompt = new tabris.Button({
    left: 10, top: [buttonConfirm, 10], right: 10,
    text: 'Show Prompt'
  }).appendTo(parent).on('select', function() {
    navigator.notification.prompt(
        'Please enter your name', // message
        function(results) {
          textView.text = 'You selected button number ' + results.buttonIndex + ' and entered ' + results.input1;
        }, // callback to invoke
        'Registration', // title
        ['Ok', 'Exit'], // buttonTextViews
        'Jane Doe' // defaultText
    );
  });

  var buttonBeep = new tabris.Button({
    left: 10, top: [buttonPrompt, 10], right: 10,
    text: 'Beep twice'
  }).appendTo(parent).on('select', function() {
    navigator.notification.beep(2);
  });

  var textView = new tabris.TextView({
    top: [buttonBeep, 20], left: 20, right: 20
  }).appendTo(parent);
});

module.exports = page;

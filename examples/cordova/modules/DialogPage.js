var PluginPage = require("./PluginPage");

var page = new PluginPage("Dialog", "org.apache.cordova.dialogs", function(parent) {

  var buttonAlert = tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Show Alert Dialog"
  }).appendTo(parent).on("select", function() {
    navigator.notification.alert(
      "You are the winner!", // message
      function() {
        textView.set("text", "Alert closed");
      }, // callback
      "Game Over", // title
      "Done" // buttonName
    );
  });

  var buttonConfirm = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonAlert, 10], right: 10},
    text: "Show Confirm Dialog"
  }).appendTo(parent).on("select", function() {
    navigator.notification.confirm(
        "You are the winner!", // message
         function(buttonIndex) {
           textView.set("text", "Confirm closed with code: " + buttonIndex);
         }, // callback to invoke with index of button pressed
        "Game Over", // title
        ["Restart", "Exit"] // buttonTextViews
    );
  });

  var buttonPrompt = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonConfirm, 10], right: 10},
    text: "Show Prompt"
  }).appendTo(parent).on("select", function() {
    navigator.notification.prompt(
        "Please enter your name", // message
        function(results) {
          textView.set("text", "You selected button number " + results.buttonIndex + " and entered " + results.input1);
        }, // callback to invoke
        "Registration", // title
        ["Ok", "Exit"], // buttonTextViews
        "Jane Doe" // defaultText
    );
  });

  var buttonBeep = tabris.create("Button", {
    layoutData: {left: 10, top: [buttonPrompt, 10], right: 10},
    text: "Beep twice"
  }).appendTo(parent).on("select", function() {
    navigator.notification.beep(2);
  });

  var textView = tabris.create("TextView", {
    layoutData: {top: [buttonBeep, 20], left: 20, right: 20}
  }).appendTo(parent);
});

module.exports = page;

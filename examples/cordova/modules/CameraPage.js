var PluginPage = require("./PluginPage");

var page = new PluginPage("Camera", "cordova-plugin-camera", function(parent) {
  var button = tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Take a picture"
  }).appendTo(parent).on("select", function() {
    navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,
      targetWidth: 1024,
      targetHeight: 1024,
      destinationType: window.Camera.DestinationType.FILE_URI
    });
    function onSuccess(imageUrl) {
      imageView.set("image", {src: imageUrl});
    }
    function onFail(message) {
      console.log("Camera failed because: " + message);
    }
  });

  var imageView = tabris.create("ImageView", {
    layoutData: {top: [button, 20], left: 20, right: 20, bottom: 20}
  }).appendTo(parent);
});

module.exports = page;

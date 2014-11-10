tabris.registerWidget("Video", {
  _type: "tabris.widgets.Video",
  _checkProperty: true,
  _listen: {Playback:true},
  _trigger: {Playback:true}
});

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Video",
    topLevel: true
  });

  var controls = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, bottom: 0, height: 90}
  }).appendTo(page);

  var video = tabris.create("Video", {
    enabled: true,
    controls_visible: true,
    repeat: false,
    playback: "play",
    layoutData: {left: 0, right: 0, top: 0, bottom: [controls, 0]},
    url: "http://mirrorblender.top-ix.org/movies/sintel-1024-surround.mp4"
  }).appendTo(page);

  var playButton = tabris.create("Button", {
    layoutData: {top: 5, left: 5, width: 60},
    text: "play"
  }).on("selection", function() {
    video.set("playback", "play");
  }).appendTo(controls);

  var pauseButton = tabris.create("Button", {
    layoutData: {top: 5, left: [playButton, 5], width: 70},
    text: "pause",
    enabled: false
  }).on("selection", function() {
    video.set("playback", "pause");
  }).appendTo(controls);

  var stopButton = tabris.create("Button", {
    layoutData: {top: 5, left: [pauseButton, 5], width: 60},
    text: "stop",
    enabled: false
  }).on("selection", function() {
    video.set("playback", "stop");
  }).appendTo(controls);

  var backwardButton = tabris.create("Button", {
    layoutData: {top: 5, left: [stopButton, 5], width: 100},
    text: "backward"
  }).on("selection", function() {
    video.set("playback", "fast_backward");
  }).appendTo(controls);

  var forwardButton = tabris.create("Button", {
    layoutData: {top: 5, left: [backwardButton, 5], width: 90},
    text: "forward"
  }).on("selection", function() {
    video.set("playback", "fast_forward");
  }).appendTo(controls);

  tabris.create("Button", {
    layoutData: {top: 5, left: [forwardButton, 5], width: 100},
    text: "fullscreen"
  }).on("selection", function() {
    video.set("presentation", "full_screen");
  }).appendTo(controls);

  var controlsCheckbox = tabris.create("CheckBox", {
    layoutData: {bottom: 5, left: 5, width: 100},
    text: "Controls",
    selection: true
  }).on("change:selection", function() {
    video.set("controls_visible", this.get("selection"));
  }).appendTo(controls);

  tabris.create("CheckBox", {
    layoutData: {bottom: 5, left: [controlsCheckbox, 5], width: 100},
    text: "Repeat"
  }).on("change:selection", function() {
    video.set("repeat", this.get("selection"));
  }).appendTo(controls);

  var setButtonsEnabledState = function(buttons, state) {
    buttons.forEach(function(button) {
      button.set("enabled", state);
    });
  };

  video.on("Playback", function() {
    // TODO: toLowerCase workaround for tabris-android issue #659
    switch (this.get("playback").toLowerCase()) {
      case "play":
        playButton.set("enabled", false);
        setButtonsEnabledState([pauseButton, stopButton, forwardButton], true);
        break;
      case "pause":
      case "stop":
        setButtonsEnabledState([playButton, forwardButton, backwardButton], true);
        setButtonsEnabledState([pauseButton, stopButton], false);
        break;
      case "fast_forward":
        setButtonsEnabledState([playButton, pauseButton, stopButton, backwardButton], true);
        forwardButton.set("enabled", false);
        break;
      case "fast_backward":
        setButtonsEnabledState([playButton, pauseButton, stopButton, forwardButton], true);
        backwardButton.set("enabled", false);
        break;
    }
  });

  page.open();

});

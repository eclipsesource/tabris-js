tabris.registerWidget("Video", {
  _type: "tabris.widgets.Video"
});

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Video",
    topLevel: true
  });

  var video = tabris.create("tabris.widgets.Video", {
    enabled: true,
    controls_visible: true,
    repeat: false,
    playback: "play",
    // TODO: workaround for tabris-ios bug #451
    layoutData: {left: 0, right: 0, top: 0, height: 500},
    url: "http://mirrorblender.top-ix.org/movies/sintel-1024-surround.mp4"
  }).appendTo(page);

  var controls = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, bottom: 0, height: 90}
  });

  var playButton = tabris.create("Button", {
    layoutData: {top: 5, left: 5, width: 60},
    text: "play"
  });

  playButton.on("selection", function() {
    video.set("playback", "play");
  });

  var pauseButton = tabris.create("Button", {
    layoutData: {top: 5, left: [playButton, 5], width: 70},
    text: "pause"
  });

  pauseButton.on("selection", function() {
    video.set("playback", "pause");
  });

  var stopButton = tabris.create("Button", {
    layoutData: {top: 5, left: [pauseButton, 5], width: 60},
    text: "stop"
  });

  stopButton.on("selection", function() {
    video.set("playback", "stop");
  });

  var backwardButton = tabris.create("Button", {
    layoutData: {top: 5, left: [stopButton, 5], width: 100},
    text: "backward"
  });

  backwardButton.on("selection", function() {
    video.set("playback", "fast_backward");
  });

  var forwardButton = tabris.create("Button", {
    layoutData: {top: 5, left: [backwardButton, 5], width: 90},
    text: "forward"
  });

  forwardButton.on("selection", function() {
    video.set("playback", "fast_forward");
  });

  var fullscreenButton = tabris.create("Button", {
    layoutData: {top: 5, left: [forwardButton, 5], width: 100},
    text: "fullscreen"
  });

  fullscreenButton.on("selection", function() {
    video.set("presentation", "full_screen");
  });

  var controlsCheckbox = tabris.create("CheckBox", {
    layoutData: {bottom: 5, left: 5, width: 100},
    text: "Controls",
    selection: true
  });

  controlsCheckbox.on("selection", function() {
    // TODO: workaround for tabris-js bug #14
    video.set("controls_visible", !video.get("controls_visible"));
  });

  var repeatCheckbox = tabris.create("CheckBox", {
    layoutData: {bottom: 5, left: [controlsCheckbox, 5], width: 100},
    text: "Repeat"
  });

  repeatCheckbox.on("selection", function() {
    // TODO: workaround for tabris-js bug #14
    video.set("repeat", !video.get("repeat"));
  });

  controls.append(playButton, pauseButton, stopButton, backwardButton, forwardButton,
    fullscreenButton, controlsCheckbox, repeatCheckbox);
  page.append(video, controls);

  page.open();

});

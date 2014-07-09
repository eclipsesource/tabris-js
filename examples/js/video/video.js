tabris.load(function() {

  var page = tabris.createPage({
    title: "Video",
    topLevel: true
  });

  var video = page.append("tabris.widgets.Video", {
    enabled: true,
    controls_visible: true,
    repeat: false,
    playback: "play",
    // TODO: workaround for tabris-ios bug #451
    layoutData: {left: 0, right: 0, height: 500},
    url: "http://mirrorblender.top-ix.org/movies/sintel-1024-surround.mp4"
  });

  var controls = page.append("Composite", {
    layoutData: {left: 0, right: 0, bottom: 0, height: 90}
  });

  var playButton = controls.append("Button", {
    layoutData: {top: 5, left: 5, width: 60},
    text: "play"
  });

  playButton.on("Selection", function() {
    video.set("playback", "play");
  });

  var pauseButton = controls.append("Button", {
    layoutData: {top: 5, left: [playButton, 5], width: 70},
    text: "pause"
  });

  pauseButton.on("Selection", function() {
    video.set("playback", "pause");
  });

  var stopButton = controls.append("Button", {
    layoutData: {top: 5, left: [pauseButton, 5], width: 60},
    text: "stop"
  });

  stopButton.on("Selection", function() {
    video.set("playback", "stop");
  });

  var backwardButton = controls.append("Button", {
    layoutData: {top: 5, left: [stopButton, 5], width: 100},
    text: "backward"
  });

  backwardButton.on("Selection", function() {
    video.set("playback", "fast_backward");
  });

  var forwardButton = controls.append("Button", {
    layoutData: {top: 5, left: [backwardButton, 5], width: 90},
    text: "forward"
  });

  forwardButton.on("Selection", function() {
    video.set("playback", "fast_forward");
  });

  var fullscreenButton = controls.append("Button", {
    layoutData: {top: 5, left: [forwardButton, 5], width: 100},
    text: "fullscreen"
  });

  fullscreenButton.on("Selection", function() {
    video.set("presentation", "full_screen");
  });

  var controlsCheckbox = controls.append("Button", {
    // TODO: height explicitly set as a workaround for tabris-android bug #527
    layoutData: {bottom: 5, left: 5, width: 100, height: 30},
    style: ['CHECK'],
    text: "Controls",
    selection: true
  });

  controlsCheckbox.on("Selection", function() {
    // TODO: workaround for tabris-js bug #14
    video.set("controls_visible", !video.get("controls_visible"));
  });

  var repeatCheckbox = controls.append("Button", {
    // TODO: height explicitly set as a workaround for tabris-android bug #527
    layoutData: {bottom: 5, left: [controlsCheckbox, 5], width: 100, height: 30},
    style: ['CHECK'],
    text: "Repeat"
  });

  repeatCheckbox.on("Selection", function() {
    // TODO: workaround for tabris-js bug #14
    video.set("repeat", !video.get("repeat"));
  });

  page.open();

});
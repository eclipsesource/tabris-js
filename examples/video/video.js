// This example uses internal API that is likely going to change. The internal API is listed below:
tabris.Video._checkProperty.playback = true;
tabris.Video._checkProperty.controls_visible = true;
tabris.Video._checkProperty.repeat = true;
tabris.Video._listen.Playback = true;

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
    playback: "play",
    layoutData: {left: 0, right: 0, top: 0, bottom: [controls, 0]},
    url: "http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4"
  }).appendTo(page);

  var playButton = tabris.create("Button", {
    layoutData: {top: 5, left: 5, width: 60},
    text: "play"
  }).on("selection", function() {
    video.set("playback", "play");
    togglePlay(true);
  }).appendTo(controls);

  var pauseButton = tabris.create("Button", {
    layoutData: {top: 5, left: [playButton, 5], width: 70},
    text: "pause",
    enabled: false
  }).on("selection", function() {
    video.set("playback", "pause");
    togglePlay(false);
  }).appendTo(controls);

  var stopButton = tabris.create("Button", {
    layoutData: {top: 5, left: [pauseButton, 5], width: 60},
    text: "stop",
    enabled: false
  }).on("selection", function() {
    video.set("playback", "stop");
    togglePlay(false);
  }).appendTo(controls);

  tabris.create("Button", {
    layoutData: {top: 5, left: [stopButton, 5], width: 100},
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
        togglePlay(true);
        break;
      case "pause":
      case "stop":
        togglePlay(false);
        break;
    }
  });

  page.open();

  function togglePlay(playing) {
    if (playing) {
      playButton.set("enabled", false);
      setButtonsEnabledState([pauseButton, stopButton], true);
    } else {
      setButtonsEnabledState([playButton], true);
      setButtonsEnabledState([pauseButton, stopButton], false);
    }
  }

});

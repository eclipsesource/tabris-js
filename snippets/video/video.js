var page = new tabris.Page({
  title: "Video",
  topLevel: true
});

var video = new tabris.Video({
  left: 16, top: 0, width: 500, height: 500,
  url: "http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4",
  controlsVisible: false
}).appendTo(page);

new tabris.Button({
  text: "Play/Pause",
  left: 16, top: "prev() 16"
}).on("select", function() {
  video.get("state") === "play" ? video.pause() : video.play();
}).appendTo(page);

page.open();

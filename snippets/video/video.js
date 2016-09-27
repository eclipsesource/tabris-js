var page = new tabris.Page({
  title: "Video",
  topLevel: true
});

var video = new tabris.Video({
  left: 0, top: 0, right: 0, bottom: "#button 16",
  url: "http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4",
  controlsVisible: false
}).on("change:state", function(widget, state) {
  button.set("text", state !== "pause" ? "❚❚" : "▶");
}).appendTo(page);

var button = new tabris.Button({
  id: "button",
  centerX: 0, bottom: 16,
  text: "❚❚"
}).on("select", function() {
  video.get("state") === "play" ? video.pause() : video.play();
}).appendTo(page);

page.open();

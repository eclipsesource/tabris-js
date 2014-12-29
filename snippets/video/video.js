var page = tabris.create("Page", {
  title: "Video",
  topLevel: true
});

tabris.create("Video", {
  layoutData: {left: 0, right: 0, top: 0, bottom: 0},
  url: "http://peach.themazzone.com/durian/movies/sintel-1280-stereo.mp4"
}).appendTo(page);

page.open();

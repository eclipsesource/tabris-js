var MARGIN = 12;
var $ = require("./lib/jquery.min.js");

var page = tabris.create("Page", {
  title: "Reddit",
  topLevel: true
});

var progressBar = tabris.create("ProgressBar", {
  layoutData: {left: 15, right: 15, centerY: 0},
  maximum: 100
}).appendTo(page);

setProgress(20);

var loadingLabel = tabris.create("Label", {
  layoutData: {left: MARGIN, right: MARGIN, bottom: [progressBar, 20]},
  alignment: "center",
  text: "loading data from reddit ..."
}).appendTo(page);

$.getJSON("http://www.reddit.com/r/petpictures.json?limit=100", function(json) {
  loadingLabel.set("visible", false);
  progressBar.set("visible", false);
  tabris.create("CollectionView", {
    layoutData: {left: 0, top: 0, right: 0, bottom: 0},
    background: "white",
    items: json.data.children,
    itemHeight: 84,
    initializeCell: function(cell) {
      var imageView = tabris.create("ImageView", {
        layoutData: {left: MARGIN, top: 4, width: 76, height: 76},
        scaleMode: "fill"
      }).appendTo(cell);
      var nameLabel = tabris.create("Label", {
        layoutData: {left: [imageView, 16], top: 5, right: 16, height: 60}
      }).appendTo(cell);
      var authorLabel = tabris.create("Label", {
        layoutData: {left: [imageView, 16], bottom: 4, width: 200},
        foreground: "#234"
      }).appendTo(cell);
      var commentsLabel = tabris.create("Label", {
        layoutData: {right: MARGIN, bottom: 4 , width: 200},
        alignment: "right",
        foreground: "green"
      }).appendTo(cell);
      // create a horizontal line
      tabris.create("Composite", {
        layoutData: {left: 0, right: 0, bottom: 0, height: 1},
        background: "rgba(20,20,20,0.3)"
      }).appendTo(cell);
      cell.on("itemchange", function(element) {
        imageView.set("image", {src: element.data.thumbnail});
        nameLabel.set("text", element.data.title);
        authorLabel.set("text", element.data.author);
        commentsLabel.set("text", element.data.num_comments + " comments");
      });
    }
  }).on("selection", function(event) {
    var detailPage = tabris.create("Page", {
      topLevel: false
    });
    var url = event.item.data.url;
    tabris.create("Label", {
      text: event.item.data.title,
      layoutData: {left: 0, right: 0, bottom: 0},
      font: "24px",
      foreground: "white",
      background: "rgba(40,40,40,0.5)",
      alignment: "center"
    }).appendTo(detailPage);
    if (url.indexOf("jpg", url.length - 3) !== -1) {
      tabris.create("ImageView", {
        layoutData: {left: 0, top: 0, right: 0, bottom: 0},
        image: {src: url},
        scaleMode: "fit"
      }).appendTo(detailPage);
    } else {
      tabris.create("WebView", {
        layoutData: {left: 0, top: 0, right: 0, bottom: 0},
        url: event.item.data.url
      }).appendTo(detailPage);
    }
    detailPage.open();
  }).appendTo(page);
});

page.open();

function setProgress(timeout) {
  setTimeout(function() {
    var progress = progressBar.get("selection") + 1;
    progressBar.set("selection", progress);
    if (progress < 100) {
      setProgress(timeout * 1.03);
    }
  }, timeout);
}

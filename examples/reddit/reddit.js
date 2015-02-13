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

var loadingTextView = tabris.create("TextView", {
  layoutData: {left: MARGIN, right: MARGIN, bottom: [progressBar, 20]},
  alignment: "center",
  text: "loading data from reddit ..."
}).appendTo(page);

$.getJSON("http://www.reddit.com/r/petpictures.json?limit=100", function(json) {
  loadingTextView.set("visible", false);
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
      var nameText = tabris.create("TextView", {
        maxLines: 2
      }).appendTo(cell);
      var authorText = tabris.create("TextView", {
        foreground: "#234"
      }).appendTo(cell);
      var commentsText = tabris.create("TextView", {
        alignment: "right",
        foreground: "green"
      }).appendTo(cell);
      // create a horizontal line
      var divider = tabris.create("Composite", {
        background: "rgba(20,20,20,0.3)"
      }).appendTo(cell);
      cell.on("itemchange", function(element) {
        imageView.set("image", {src: element.data.thumbnail});
        nameText.set("text", element.data.title);
        authorText.set("text", element.data.author);
        commentsText.set("text", element.data.num_comments + " comments");
      }).on("change:bounds", function() {
        var cellWidth = cell.get("bounds").width;
        var textWidth = 200;
        divider.set("layoutData", {top: 83, left: MARGIN, width: cellWidth - 2 * MARGIN, height: 1});
        commentsText.set("layoutData", {top: 60, left: cellWidth - textWidth - MARGIN, height: 20, width: textWidth});
        authorText.set("layoutData", {top: 60, left: 104, height: 20, width: textWidth});
        nameText.set("layoutData", {left: 104, top: 5, width: cellWidth - textWidth - MARGIN});
      });
    }
  }).on("selection", function(event) {
    var detailPage = tabris.create("Page", {
      background: "black",
      title: event.item.data.title,
      topLevel: false
    });
    var url = event.item.data.url;
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

var MARGIN = 12;
var $ = require("./lib/jquery.min.js");

var page = tabris.create("Page", {
  title: "Reddit - Pets",
  topLevel: true
});

var collectionView = tabris.create("CollectionView", {
  layoutData: {left: 0, top: 0, right: 0, bottom: 0},
  itemHeight: 82,
  refreshEnabled: true,
  initializeCell: function(cell) {
    var imageView = tabris.create("ImageView", {
      layoutData: {left: MARGIN, top: 6, width: 70, height: 70},
      scaleMode: "fill"
    }).appendTo(cell);
    var nameView = tabris.create("TextView", {
      maxLines: 2
    }).appendTo(cell);
    var authorView = tabris.create("TextView", {
      foreground: "#234"
    }).appendTo(cell);
    var commentsView = tabris.create("TextView", {
      alignment: "right",
      foreground: "green"
    }).appendTo(cell);
    cell.on("change:item", function(widget, item) {
      if (item.loading) {
        cell.children().set("visible", false);
        nameView.set({visible: true, text: "loading ..."});
        loadMoreData();
      } else {
        cell.children().set("visible", true);
        imageView.set("image", item.data.thumbnail);
        nameView.set("text", item.data.title);
        authorView.set("text", item.data.author);
        commentsView.set("text", item.data.num_comments + " comments");
      }
    }).on("change:bounds", function() {
      var cellWidth = cell.get("bounds").width;
      var textWidth = 200;
      nameView.set("layoutData", {left: 104, top: 6, width: cellWidth - textWidth - MARGIN});
      authorView.set("layoutData", {top: 54, left: 104, height: 20, width: textWidth});
      commentsView.set("layoutData", {top: 54, left: cellWidth - textWidth - MARGIN, height: 20, width: textWidth});
    });
  }
}).on("refresh", function() {
  loadNewData();
}).on("select", function(target, value) {
  if (!value.loading) {
    createDetailsPage(value.data);
  }
}).appendTo(page);

page.open();
loadData();

function loadData() {
  collectionView.set("refreshIndicator", true);
  $.getJSON(createUrl({limit: 25}), function(json) {
    // add a placeholder item for loading new items
    collectionView.set("items", json.data.children.concat({loading: true}));
    collectionView.set("refreshIndicator", false);
  });
}

function loadNewData() {
  $.getJSON(createUrl({limit: 25, before: getFirstId()}), function(json) {
    collectionView.insert(json.data.children, 0);
    collectionView.reveal(0);
    collectionView.set("refreshIndicator", false);
  });
}

function loadMoreData() {
  $.getJSON(createUrl({limit: 25, after: getLastId()}), function(json) {
    // add new placeholder item for loading new items
    collectionView.insert(json.data.children.concat({loading: true}), -1);
    // remove old placeholder item
    collectionView.remove(-1);
  });
}

function createUrl(params) {
  return "http://www.reddit.com/r/petpictures.json?" + Object.keys(params).map(function(key) {
    return key + "=" + params[key];
  }).join("&");
}

function getFirstId() {
  return getRedditId(collectionView.get("items")[0]) || null;
}

function getLastId() {
  var items = collectionView.get("items");
  return getRedditId(items[items.length - 2]) || null;
}

function getRedditId(item) {
  return item ? item.kind + "_" + item.data.id : null;
}

function createDetailsPage(data) {
  var detailPage = tabris.create("Page", {
    background: "black",
    title: data.title,
    topLevel: false
  });
  if (data.url.substr(-4, 4) === ".jpg") {
    tabris.create("ImageView", {
      layoutData: {left: 0, top: 0, right: 0, bottom: 0},
      image: data.url,
      scaleMode: "fit"
    }).appendTo(detailPage);
  } else {
    tabris.create("WebView", {
      layoutData: {left: 0, top: 0, right: 0, bottom: 0},
      url: data.url
    }).appendTo(detailPage);
  }
  detailPage.open();
}

/*globals Promise: true, fetch: false*/
Promise = require("promise");
require("whatwg-fetch");

var MARGIN = 12;

var page = tabris.create("Page", {
  title: "Reddit - Pets",
  topLevel: true
});

var collectionView = tabris.create("CollectionView", {
  left: 0, top: 0, right: 0, bottom: 0,
  itemHeight: 82,
  refreshEnabled: true,
  cellType: function(item) {
    return item.loading ? "loading" : "normal";
  },
  initializeCell: function(cell, type) {
    if (type === "loading") {
      initializeLoadingCell(cell);
    } else {
      initializeStandardCell(cell);
    }
  }
}).on("refresh", function() {
  loadNewItems();
}).on("select", function(target, value) {
  if (!value.loading) {
    createDetailsPage(value.data);
  }
}).appendTo(page);

page.open();
loadItems();

function initializeStandardCell(cell) {
  var imageView = tabris.create("ImageView", {
    left: MARGIN, top: 6, width: 70, height: 70,
    scaleMode: "fill"
  }).appendTo(cell);
  var nameView = tabris.create("TextView", {
    maxLines: 2
  }).appendTo(cell);
  var authorView = tabris.create("TextView", {
    textColor: "#234"
  }).appendTo(cell);
  var commentsView = tabris.create("TextView", {
    alignment: "right",
    textColor: "green"
  }).appendTo(cell);
  cell.on("change:item", function(widget, item) {
    imageView.set("image", item.data.thumbnail);
    nameView.set("text", item.data.title);
    authorView.set("text", item.data.author);
    commentsView.set("text", item.data.num_comments + " comments");
  }).on("resize", function() {
    var cellWidth = cell.get("bounds").width;
    var textWidth = 200;
    nameView.set({left: 104, top: 6, width: cellWidth - textWidth - MARGIN});
    authorView.set({top: 54, left: 104, height: 20, width: textWidth});
    commentsView.set({top: 54, left: cellWidth - textWidth - MARGIN, height: 20, width: textWidth});
  });
}

function initializeLoadingCell(cell) {
  tabris.create("TextView", {
    left: 12, right: 12, centerY: 0,
    alignment: "center",
    text: "loading ..."
  }).appendTo(cell);
  cell.on("change:item", function() {
    loadMoreItems();
  });
}

function loadItems() {
  collectionView.set("refreshIndicator", true);
  getJSON(createUrl({limit: 25})).then(function(json) {
    // add a placeholder item for loading new items
    collectionView.set("items", json.data.children.concat({loading: true}));
    collectionView.set("refreshIndicator", false);
  });
}

function loadNewItems() {
  getJSON(createUrl({limit: 25, before: getFirstId()})).then(function(json) {
    collectionView.insert(json.data.children, 0);
    collectionView.reveal(0);
    collectionView.set("refreshIndicator", false);
  });
}

function loadMoreItems() {
  getJSON(createUrl({limit: 25, after: getLastId()})).then(function(json) {
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
      left: 0, top: 0, right: 0, bottom: 0,
      image: data.url,
      scaleMode: "fit"
    }).appendTo(detailPage);
  } else {
    tabris.create("WebView", {
      left: 0, top: 0, right: 0, bottom: 0,
      url: data.url
    }).appendTo(detailPage);
  }
  detailPage.open();
}

function getJSON(url) {
  return fetch(url).then(function(response) {
    return response.json();
  });
}

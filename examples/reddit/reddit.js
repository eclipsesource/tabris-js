/*globals Promise: true, fetch: false*/
Promise = require("promise");
require("whatwg-fetch");

var MARGIN = 12;
var loading;

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
}).on("scroll", function(view, scroll) {
  if (scroll.deltaY > 0) {
    var remaining = view.get("items").length - view.get("lastVisibleIndex");
    if (remaining < 20) {
      loadMoreItems();
    }
  }
}).on("select", function(target, value) {
  if (!value.loading) {
    createDetailsPage(value.data);
  }
}).appendTo(page);

page.open();
loadInitialItems();

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
}

function loadInitialItems() {
  collectionView.set("refreshIndicator", true);
  getJSON(createUrl({limit: 25})).then(function(json) {
    collectionView.set("items", json.data.children);
    collectionView.set("refreshIndicator", false);
  });
}

function loadNewItems() {
  if (!loading) {
    loading = true;
    getJSON(createUrl({limit: 25, before: getFirstId()})).then(function(json) {
      collectionView.insert(json.data.children, 0);
      collectionView.reveal(0);
      collectionView.set("refreshIndicator", false);
      loading = false;
    });
  }
}

function loadMoreItems() {
  if (!loading) {
    loading = true;
    var lastId = getLastId();
    // insert placeholder item
    collectionView.insert([{loading: true}], -1);
    getJSON(createUrl({limit: 25, after: lastId})).then(function(json) {
      // remove placeholder item
      collectionView.remove(-1);
      collectionView.insert(json.data.children, -1);
      loading = false;
    });
  }
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

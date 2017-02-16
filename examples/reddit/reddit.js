var MARGIN = 12;
var loading;

var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var page = new tabris.Page({
  title: 'Reddit - Pets'
}).appendTo(navigationView);

var collectionView = new tabris.CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  itemHeight: 82,
  refreshEnabled: true,
  cellType: function(item) {
    return item.loading ? 'loading' : 'normal';
  },
  initializeCell: function(cell, type) {
    if (type === 'loading') {
      initializeLoadingCell(cell);
    } else {
      initializeStandardCell(cell);
    }
  }
}).on('refresh', function() {
  loadNewItems();
}).on('scroll', function({target, deltaY}) {
  if (deltaY > 0) {
    var remaining = target.items.length - target.lastVisibleIndex;
    if (remaining < 20) {
      loadMoreItems();
    }
  }
}).on('select', function({item}) {
  if (!item.loading) {
    createDetailsPage(item.data);
  }
}).appendTo(page);

loadInitialItems();

function initializeStandardCell(cell) {
  var imageView = new tabris.ImageView({
    left: MARGIN, top: 6, width: 70, height: 70,
    scaleMode: 'fill'
  }).appendTo(cell);
  var nameView = new tabris.TextView({
    top: 6, left: 104, right: MARGIN,
    maxLines: 2
  }).appendTo(cell);
  var commentsView = new tabris.TextView({
    top: 54, right: MARGIN,
    alignment: 'right',
    textColor: 'green'
  }).appendTo(cell);
  var authorView = new tabris.TextView({
    top: 54, left: 104, height: 20, right: [commentsView, MARGIN],
    textColor: '#234'
  }).appendTo(cell);
  cell.on('change:item', function({value: item}) {
    imageView.image = {src: item.data.thumbnail, width: 70, height: 70};
    nameView.text = item.data.title;
    authorView.text = item.data.author;
    commentsView.text = item.data.num_comments + ' comments';
  });
}

function initializeLoadingCell(cell) {
  new tabris.TextView({
    left: 12, right: 12, centerY: 0,
    alignment: 'center',
    text: 'loading ...'
  }).appendTo(cell);
}

function loadInitialItems() {
  collectionView.refreshIndicator = true;
  getJSON(createUrl({limit: 25})).then(function(json) {
    collectionView.items = json.data.children;
    collectionView.refreshIndicator = false;
  });
}

function loadNewItems() {
  if (!loading) {
    loading = true;
    getJSON(createUrl({limit: 25, before: getFirstId()})).then(function(json) {
      collectionView.insert(json.data.children, 0);
      collectionView.reveal(0);
      collectionView.refreshIndicator = false;
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
  return 'http://www.reddit.com/r/petpictures.json?' + Object.keys(params).map(function(key) {
    return key + '=' + params[key];
  }).join('&');
}

function getFirstId() {
  return getRedditId(collectionView.items[0]) || null;
}

function getLastId() {
  var items = collectionView.items;
  return getRedditId(items[items.length - 2]) || null;
}

function getRedditId(item) {
  return item ? item.kind + '_' + item.data.id : null;
}

function createDetailsPage(data) {
  var detailPage = new tabris.Page({
    background: 'black',
    title: data.title
  }).appendTo(navigationView);
  if (data.url.substr(-4, 4) === '.jpg') {
    new tabris.ImageView({
      left: 0, top: 0, right: 0, bottom: 0,
      image: data.url,
      scaleMode: 'fit'
    }).appendTo(detailPage);
  } else {
    new tabris.WebView({
      left: 0, top: 0, right: 0, bottom: 0,
      url: data.url
    }).appendTo(detailPage);
  }
}

function getJSON(url) {
  return fetch(url).then(function(response) {
    return response.json();
  });
}

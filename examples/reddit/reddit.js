const {CollectionView, Composite, ImageView, NavigationView, Page, TextView, WebView, ui} = require('tabris');

const ITEM_FETCH_COUNT = 25;

let loading;
let items = [];

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

const page = new Page({
  title: 'Reddit - Pets'
}).appendTo(navigationView);

const collectionView = new CollectionView({
  left: 0, top: 0, right: 0, bottom: 0,
  background: '#f5f5f5',
  refreshEnabled: true,
  cellHeight: 96,
  cellType: index => items[index].loading ? 'loading' : 'normal',
  createCell: (type) => {
    if (type === 'normal') {
      return createItemCell();
    }
    return createLoadingCell();
  },
  updateCell: (view, index) => {
    const item = items[index];
    if (!(item.loading)) {
      view.find('#container').first().item = item;
      view.find('#itemImage').set({image: {src: item.data.thumbnail, width: 80, height: 80}});
      view.find('#nameText').set({text: item.data.title});
      view.find('#commentText').set({text: item.data.num_comments + ' comments'});
      view.find('#authorText').set({text: item.data.author});
    }
  }
}).on('refresh', loadNewItems)
  .on('scroll', ({target: scrollView, deltaY}) => {
    if (deltaY > 0) {
      const remaining = items.length - scrollView.lastVisibleIndex;
      if (remaining < 20) {
        loadMoreItems();
      }
    }
  }).appendTo(page);

loadInitialItems();

function createItemCell() {
  const cell = new Composite();
  const container = new Composite({
    id: 'container',
    left: 16, right: 16, top: 8, bottom: 8,
    cornerRadius: 2,
    elevation: 2,
    background: 'white',
    highlightOnTouch: true
  }).on('tap', ({target: view}) => createDetailsPage(view.item.data))
    .appendTo(cell);
  new ImageView({
    id: 'itemImage',
    background: '#e0e0e0',
    width: 80, height: 80,
    scaleMode: 'fill'
  }).appendTo(container);
  new TextView({
    id: 'nameText',
    top: 8, left: ['#itemImage', 16], right: 16,
    textColor: '#202020',
    font: 'medium 14px',
    maxLines: 2
  }).appendTo(container);
  new TextView({
    id: 'commentText',
    bottom: 8, right: 16,
    alignment: 'right',
    textColor: '#7CB342',
    font: '12px'
  }).appendTo(container);
  new TextView({
    id: 'authorText',
    bottom: 8, left: '#itemImage 16', right: '#commentText 16',
    textColor: '#767676',
    font: '12px'
  }).appendTo(container);
  return cell;
}

function createLoadingCell() {
  return new TextView({
    centerY: 0,
    alignment: 'center',
    text: 'Loading...'
  });
}

function loadInitialItems() {
  collectionView.refreshIndicator = true;
  getJSON(createUrl({limit: ITEM_FETCH_COUNT})).then(json => {
    items = json.data.children;
    collectionView.itemCount = items.length;
    collectionView.refreshIndicator = false;
  });
}

function loadNewItems() {
  if (!loading) {
    loading = true;
    getJSON(createUrl({limit: ITEM_FETCH_COUNT, before: getFirstId()})).then(json => {
      loading = false;
      collectionView.refreshIndicator = false;
      if (json.data.children.length > 0) {
        items.splice(0, 0, json.data.children);
        collectionView.insert(0, json.data.children.length);
        collectionView.reveal(0);
      }
    });
  }
}

function loadMoreItems() {
  if (!loading) {
    loading = true;
    const lastId = getLastId();
    // insert placeholder item
    items.push({loading: true});
    collectionView.insert(items.length, 1);
    getJSON(createUrl({limit: ITEM_FETCH_COUNT, after: lastId})).then(json => {
      loading = false;
      // remove placeholder item
      items.splice(items.length - 1, 1);
      collectionView.remove(-1);
      // insert new items
      const insertionIndex = items.length;
      items = items.concat(json.data.children);
      collectionView.insert(insertionIndex, json.data.children.length);
    });
  }
}

function createUrl(params) {
  return 'http://www.reddit.com/r/petpictures.json?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
}

function getFirstId() {
  return getRedditId(items[0]) || null;
}

function getLastId() {
  return getRedditId(items[items.length - 1]) || null;
}

function getRedditId(item) {
  return item ? item.kind + '_' + item.data.id : null;
}

function createDetailsPage(data) {
  const detailsPage = new Page({
    background: 'black',
    title: data.title
  }).appendTo(navigationView);
  if (data.url.substr(-4, 4) === '.jpg') {
    new ImageView({
      left: 0, top: 0, right: 0, bottom: 0,
      image: data.url,
      scaleMode: 'fit',
      zoomEnabled: true
    }).appendTo(detailsPage);
  } else {
    new WebView({
      left: 0, top: 0, right: 0, bottom: 0,
      url: data.url
    }).appendTo(detailsPage);
  }
}

function getJSON(url) {
  return fetch(url).then(response => response.json());
}

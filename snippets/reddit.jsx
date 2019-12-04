import {app, CollectionView, Composite, contentView, ImageView, NavigationView, Page, TextView} from 'tabris';

const ITEM_FETCH_COUNT = 25;

let loading;
let items = [];

contentView.append(
  <NavigationView stretch toolbarColor={device.platform === 'iOS' ? 'white' : null}>
    <Page title='Flowers on Reddit'>
      <CollectionView
        stretch
        background='#f5f5f5'
        refreshEnabled
        cellHeight={96}
        cellType={index => items[index].loading ? 'loading' : 'normal'}
        createCell={(type) => type === 'normal' ? createItemCell() : createLoadingCell()}
        updateCell={updateCell}
        onRefresh={loadNewItems}
        onScroll={checkToLoadItems}
      />
    </Page>
  </NavigationView>
);

const navigationView = $(NavigationView).only();
const collectionView = $(CollectionView).only();

loadInitialItems();

function createItemCell() {
  return (
    <Composite>
      <Composite id='container' left={16} right={16} top={8} bottom={8} cornerRadius={2} elevation={2}
        background='white' highlightOnTouch onTap={showImage}>
        <ImageView id='image' width={80} height={80} background='#e0e0e0' scaleMode='fill'/>
        <TextView id='name' top={8} left='prev() 16' right={16} textColor='#202020' font='medium 14px' maxLines={2}/>
        <TextView id='comment' bottom={8} right={16} alignment='right' textColor='#7CB342' font='12px'/>
        <TextView id='author' bottom={8} left='#image 16' right='#comment 16' textColor='#767676' font='12px'/>
      </Composite>
    </Composite>
  );
}

function createLoadingCell() {
  return <TextView centerY alignment='centerX' text='Loading more flowers...'/>;
}

function updateCell(view, index) {
  const item = items[index];
  if (!item.loading) {
    view.find('#container').first().item = item;
    view.find('#image').only(ImageView).image = {src: item.data.thumbnail, width: 80, height: 80};
    view.find('#name').only(TextView).text = item.data.title;
    view.find('#comment').only(TextView).text = item.data.num_comments + ' comments';
    view.find('#author').only(TextView).text = item.data.author;
  }
}

function loadInitialItems() {
  collectionView.refreshIndicator = true;
  getJSON(createUrl({limit: ITEM_FETCH_COUNT})).then(json => {
    items = json.data.children;
    collectionView.itemCount = items.length;
    collectionView.refreshIndicator = false;
  });
}

function checkToLoadItems({target: scrollView, deltaY}) {
  if (deltaY > 0) {
    const remaining = items.length - scrollView.lastVisibleIndex;
    if (remaining < 20) {
      loadMoreItems();
    }
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

function createUrl(params) {
  return 'http://www.reddit.com/r/flowers.json?' +
    Object.keys(params).map(key => key + '=' + params[key]).join('&');
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

function showImage(event) {
  const data = event.target.item.data;
  if (data.url.substr(-4, 4) === '.jpg') {
    navigationView.append(
      <Page background='black' title={data.title}>
        <ImageView stretch image={data.url} scaleMode='fit' zoomEnabled/>
      </Page>
    );
  } else {
    app.launch(data.url);
  }
}

function getJSON(url) {
  return fetch(url).then(response => response.json());
}

var HORIZONTAL_MARGIN = 16;
var VERTICAL_MARGIN = 8;

var items = [
  {title: 'Up for lunch?', sender: 'John Smith', time: '11:35'},
  {title: 'JavaScript for mobile applications', sender: 'JavaScript Newsletter', time: '08:03'},
  {title: 'This is just a spam message', sender: 'Spammer', time: '04:32'},
  {title: 'CoolGrocery Discount Newsletter', sender: 'Local CoolGrocery', time: 'yesterday'},
  {title: 'Cinema this weekend?', sender: 'Robert J. Schmidt', time: 'yesterday'},
  {title: 'Coffee Club Newsletter', sender: 'Coffee Club', time: 'yesterday'},
  {title: 'Fraud mail', sender: 'Unsuspicious Jack', time: 'yesterday'}
];

var collectionView = new tabris.CollectionView({
  left: 0, right: 0, top: 0, bottom: 0,
  itemHeight: 64,
  items: items,
  initializeCell: function(cell) {
    cell.background = '#d0d0d0';
    var container = new tabris.Composite({
      left: 0, top: 0, bottom: 0, right: 0,
      background: 'white'
    }).on('pan:horizontal', function(widget, event) {
      handlePan(event, container);
    }).appendTo(cell);
    var senderView = new tabris.TextView({
      top: VERTICAL_MARGIN, left: HORIZONTAL_MARGIN,
      font: 'bold 18px'
    }).appendTo(container);
    var titleView = new tabris.TextView({
      bottom: VERTICAL_MARGIN, left: HORIZONTAL_MARGIN
    }).appendTo(container);
    var timeView = new tabris.TextView({
      textColor: '#b8b8b8',
      top: VERTICAL_MARGIN, right: HORIZONTAL_MARGIN
    }).appendTo(container);
    new tabris.Composite({
      left: 0, bottom: 0, right: 0, height: 1,
      background: '#b8b8b8'
    }).appendTo(cell);
    cell.on('change:item', function({value: item}) {
      senderView.text = item.sender;
      titleView.text = item.title;
      timeView.text = item.time;
    });
  }
}).appendTo(tabris.ui.contentView);

function handlePan(event, container) {
  container.transform = {translationX: event.translation.x};
  if (event.state === 'end') {
    handlePanFinished(event, container);
  }
}

function handlePanFinished(event, container) {
  var beyondCenter = Math.abs(event.translation.x) > container.bounds.width / 2;
  var fling = Math.abs(event.velocity.x) > 200;
  var sameDirection = sign(event.velocity.x) === sign(event.translation.x);
  // When swiped beyond the center, trigger dismiss if flinged in the same direction or let go.
  // Otherwise, detect a dismiss only if flinged in the same direction.
  var dismiss = beyondCenter ? sameDirection || !fling : sameDirection && fling;
  if (dismiss) {
    animateDismiss(event, container);
  } else {
    animateCancel(event, container);
  }
}

function animateDismiss(event, container) {
  var bounds = container.bounds;
  container.animate({
    transform: {translationX: sign(event.translation.x) * bounds.width}
  }, {
    duration: 200,
    easing: 'ease-out'
  }).then(function() {
    collectionView.remove(container.parent().itemIndex);
  });
}

function animateCancel(event, container) {
  container.animate({transform: {translationX: 0}}, {duration: 200, easing: 'ease-out'});
}

function sign(number) {
  return number ? number < 0 ? -1 : 1 : 0;
}

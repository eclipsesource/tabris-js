var MARGIN_SMALL = 14;
var MARGIN = 16;

var INITIAL_TITLE_COMPOSITE_OPACITY = 0.85;

var titleCompY = 0;

tabris.ui.statusBar.background = rgba(255, 152, 0, 1);

var scrollView = new tabris.ScrollView({
  left: 0, right: 0, top: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var imageView = new tabris.ImageView({
  left: 0, top: 0, right: 0,
  image: 'images/salad.jpg',
  scaleMode: 'fill'
}).appendTo(scrollView);

var contentComposite = new tabris.Composite({
  left: 0, right: 0, top: '#titleComposite', height: 1000,
  background: 'white'
}).appendTo(scrollView);

new tabris.TextView({
  left: MARGIN, right: MARGIN, top: MARGIN,
  text: 'Make a dressing of the yolks of 3 hard-boiled eggs pounded fine, equal ' +
    'quantities of mustard and paprika, a pinch of powdered sugar, 4 ' +
    'tablespoonfuls of oil, 2 tablespoonfuls of vinegar. Simmer over the fire, ' +
    'but do not allow to boil. Take the white meat of two chickens, and separate ' +
    'into flakes; pile it in the middle of a dish, and pour the dressing over ' +
    'it. Cut up two heads of lettuce, and arrange around the chicken. On top of ' +
    'the lettuce place the whites of the eggs, cut into rings, and lay so as to ' +
    'form a chain.'
}).appendTo(contentComposite);

var titleComposite = new tabris.Composite({
  left: 0, right: 0, height: 78,
  id: 'titleComposite',
  background: rgba(255, 152, 0, INITIAL_TITLE_COMPOSITE_OPACITY)
}).appendTo(scrollView);

new tabris.TextView({
  left: MARGIN, top: MARGIN, right: MARGIN,
  markupEnabled: true,
  text: '<b>The perfect side dish</b>',
  font: '16px',
  textColor: 'black'
}).appendTo(titleComposite);

new tabris.TextView({
  left: MARGIN, bottom: MARGIN_SMALL, right: MARGIN, top: 'prev()',
  markupEnabled: true,
  text: '<b>INDIAN SUMMER SALAD</b>',
  font: '24px',
  textColor: 'white'
}).appendTo(titleComposite);

scrollView.on('resize', function({height}) {
  imageView.height  = height / 2;
  var titleCompHeight = titleComposite.height;
  // We need the offset of the title composite in each scroll event.
  // As it can only change on resize, we assign it here.
  titleCompY = Math.min(imageView.height - titleCompHeight, height / 2);
  titleComposite.top = titleCompY;
});

scrollView.on('scrollY', function({offset}) {
  imageView.transform = {translationY: Math.max(0, offset * 0.4)};
  titleComposite.transform = {translationY: Math.max(0, offset - titleCompY)};
  var opacity = calculateTitleCompositeOpacity(offset, titleCompY);
  titleComposite.background = rgba(255, 152, 0, opacity);
});

function calculateTitleCompositeOpacity(scrollViewOffsetY, titleCompY) {
  var titleCompDistanceToTop = titleCompY - scrollViewOffsetY;
  var opacity = 1 - (titleCompDistanceToTop * (1 - INITIAL_TITLE_COMPOSITE_OPACITY)) / titleCompY;
  return opacity <= 1 ? opacity : 1;
}

function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' +  a + ')';
}

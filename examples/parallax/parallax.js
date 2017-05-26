const {Composite, ImageView, TextView, ScrollView, ui} = require('tabris');

const INITIAL_TITLE_COMPOSITE_OPACITY = 0.85;
const TITLE = 'INDIAN SUMMER SALAD';
const SUBTITLE = 'The perfect side dish';
const RECIPE = 'Make a dressing of the yolks of 3 hard-boiled eggs pounded fine, equal ' +
  'quantities of mustard and paprika, a pinch of powdered sugar, 4 ' +
  'tablespoonfuls of oil, 2 tablespoonfuls of vinegar. Simmer over the fire, ' +
  'but do not allow to boil. Take the white meat of two chickens, and separate ' +
  'into flakes; pile it in the middle of a dish, and pour the dressing over ' +
  'it. Cut up two heads of lettuce, and arrange around the chicken. On top of ' +
  'the lettuce place the whites of the eggs, cut into rings, and lay so as to ' +
  'form a chain.';

let titleCompY = 0;

ui.statusBar.background = rgba(255, 152, 0, 1);

let scrollView = new ScrollView({
  left: 0, right: 0, top: 0, bottom: 0
}).appendTo(ui.contentView);

let imageView = new ImageView({
  left: 0, top: 0, right: 0,
  image: 'images/salad.jpg',
  scaleMode: 'fill'
}).appendTo(scrollView);

let contentComposite = new Composite({
  left: 0, right: 0, top: '#titleComposite', height: 1000,
  background: 'white'
}).appendTo(scrollView);

new TextView({
  left: 16, right: 16, top: 16,
  text: RECIPE
}).appendTo(contentComposite);

let titleComposite = new Composite({
  left: 0, right: 0, height: 78,
  id: 'titleComposite',
  background: rgba(255, 152, 0, INITIAL_TITLE_COMPOSITE_OPACITY)
}).appendTo(scrollView);

new TextView({
  left: 16, top: 16, right: 16,
  text: SUBTITLE,
  font: 'bold 16px',
  textColor: 'black'
}).appendTo(titleComposite);

new TextView({
  left: 16, bottom: 14, right: 16, top: 'prev()',
  text: TITLE,
  font: 'bold 24px',
  textColor: 'white'
}).appendTo(titleComposite);

scrollView.on('resize', ({height}) => {
  imageView.height  = height / 2;
  let titleCompHeight = titleComposite.height;
  // We need the offset of the title composite in each scroll event.
  // As it can only change on resize, we assign it here.
  titleCompY = Math.min(imageView.height - titleCompHeight, height / 2);
  titleComposite.top = titleCompY;
});

scrollView.on('scrollY', ({offset}) => {
  imageView.transform = {translationY: Math.max(0, offset * 0.4)};
  titleComposite.transform = {translationY: Math.max(0, offset - titleCompY)};
  let opacity = calculateTitleCompositeOpacity(offset, titleCompY);
  titleComposite.background = rgba(255, 152, 0, opacity);
});

function calculateTitleCompositeOpacity(scrollViewOffsetY, titleCompY) {
  let titleCompDistanceToTop = titleCompY - scrollViewOffsetY;
  let opacity = 1 - (titleCompDistanceToTop * (1 - INITIAL_TITLE_COMPOSITE_OPACITY)) / titleCompY;
  return opacity <= 1 ? opacity : 1;
}

function rgba(r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' +  a + ')';
}

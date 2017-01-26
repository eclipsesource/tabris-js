var MARGIN_SMALL = 14;
var MARGIN = 16;

var INITIAL_TITLE_COMPOSITE_OPACITY = 0.85;

var titleCompY = 0;

tabris.ui.background = rgba(255, 152, 0, 1);

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
  text: 'Etiam nisl nisi, egestas quis lacus ut, tristique suscipit metus. In vehicula lectus ' +
        'metus, at accumsan elit fringilla blandit. Integer et quam sed dolor pharetra ' +
        'molestie id eget dui. Donec ac libero eu lectus dapibus placerat eu a tellus. Fusce ' +
        'vulputate ac sem sit amet bibendum. Pellentesque euismod varius purus pharetra. Sed ' +
        'vitae ipsum sit amet risus vehicula euismod in at nunc. Sed in viverra arcu, id ' +
        'blandit. Praesent sagittis quis nisl id molestie. Donec dignissim, nisl id volutpat ' +
        'consectetur, massa diam aliquam lectus, sed euismod leo elit eu justo. Integer vel ' +
        'ante sapien.\n\nNunc sit amet blandit tellus, sed neque. Proin vel elementum augue. ' +
        'Quisque gravida nulla nisl, at fermentum turpis euismod in. Maecenas tortor at ante ' +
        'vulputate iaculis at vitae sem. Nulla dui erat, viverra eget mauris in, sodales ' +
        'mollis. Integer rhoncus suscipit mi in pulvinar. Nam metus augue, dictum a egestas ' +
        'ut, gravida eget ipsum. Nunc nisl, mollis et mauris in, venenatis blandit magna. ' +
        'Nullam scelerisque tellus lacus, in lobortis purus consectetur sed. Etiam pulvinar ' +
        'sapien vel nibh vehicula, in lacinia odio pharetra. Duis tincidunt metus a semper ' +
        'auctor. Sed nec consequat augue, id vulputate orci. Nunc metus nulla, luctus id ' +
        'porttitor nec, sed lacus. Interdum et malesuada fames ac ante ipsum primis in faucibus.'
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

scrollView.on('resize', function(widget, bounds) {
  imageView.height  = bounds.height / 2;
  var titleCompHeight = titleComposite.height;
  // We need the offset of the title composite in each scroll event.
  // As it can only change on resize, we assign it here.
  titleCompY = Math.min(imageView.height - titleCompHeight, bounds.height / 2);
  titleComposite.top = titleCompY;
});

scrollView.on('scrollY', function(widget, offset) {
  imageView.transform = {translationY: Math.max(0, offset.offsetY * 0.4)};
  titleComposite.transform = {translationY: Math.max(0, offset.offsetY - titleCompY)};
  var opacity = calculateTitleCompositeOpacity(offset.offsetY, titleCompY);
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

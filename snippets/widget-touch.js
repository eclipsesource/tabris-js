var textView = new tabris.TextView({
  layoutData: {left: 20, top: 20, right: 20},
  text: 'Touch anywhere...'
}).appendTo(tabris.ui.contentView);

var printXY = function(prefix, event) {
  textView.set('text', prefix + ': ' + Math.round(event.touches[0].x) + ' X ' + Math.round(event.touches[0].y));
};

tabris.ui.contentView.on('touchstart', function(widget, event) {
  printXY('touchstart', event);
  tabris.ui.contentView.set('background', 'yellow');
}).on('touchmove', function(widget, event) {
  printXY('touchmove', event);
}).on('touchend', function(widget, event) {
  printXY('touchend', event);
  tabris.ui.contentView.set('background', 'green');
}).on('touchcancel', function(widget, event) {
  printXY('touchcancel', event);
  tabris.ui.contentView.set('background', 'red');
}).on('longpress', function(widget, event) {
  tabris.ui.contentView.set('background', 'blue');
  printXY('longpress'  , event);
});

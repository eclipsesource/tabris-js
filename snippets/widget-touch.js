var textView = new tabris.TextView({
  left: 20, top: 20, right: 20,
  text: 'Touch anywhere...'
}).appendTo(tabris.ui.contentView);

var printXY = function(prefix, event) {
  textView.text = prefix + ': ' + Math.round(event.touches[0].x) + ' X ' + Math.round(event.touches[0].y);
};

tabris.ui.contentView.on('touchstart', function(widget, event) {
  printXY('touchstart', event);
  tabris.ui.contentView.background = 'yellow';
}).on('touchmove', function(widget, event) {
  printXY('touchmove', event);
}).on('touchend', function(widget, event) {
  printXY('touchend', event);
  tabris.ui.contentView.background = 'green';
}).on('touchcancel', function(widget, event) {
  printXY('touchcancel', event);
  tabris.ui.contentView.background = 'red';
}).on('longpress', function(widget, event) {
  tabris.ui.contentView.background = 'blue';
  printXY('longpress'  , event);
});

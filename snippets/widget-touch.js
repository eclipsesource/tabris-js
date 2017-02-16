var textView = new tabris.TextView({
  left: 20, top: 20, right: 20,
  text: 'Touch anywhere...'
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.on('touchstart', function({touches}) {
  printXY('touchstart', touches);
  tabris.ui.contentView.background = 'yellow';
}).on('touchmove', function({touches}) {
  printXY('touchmove', touches);
}).on('touchend', function({touches}) {
  printXY('touchend', touches);
  tabris.ui.contentView.background = 'green';
}).on('touchcancel', function({touches}) {
  printXY('touchcancel', touches);
  tabris.ui.contentView.background = 'red';
}).on('longpress', function({touches}) {
  tabris.ui.contentView.background = 'blue';
  printXY('longpress', touches);
});

function printXY(prefix, touches) {
  textView.text = prefix + ': ' + Math.round(touches[0].x) + ' X ' + Math.round(touches[0].y);
}

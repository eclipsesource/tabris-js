var textView = new tabris.TextView({
  left: 20, top: 20, right: 20,
  text: 'Touch anywhere...'
}).appendTo(tabris.ui.contentView);

tabris.ui.contentView.on('touchStart', function({touches}) {
  printXY('touchStart', touches);
  tabris.ui.contentView.background = 'yellow';
}).on('touchMove', function({touches}) {
  printXY('touchMove', touches);
}).on('touchEnd', function({touches}) {
  printXY('touchEnd', touches);
  tabris.ui.contentView.background = 'green';
}).on('touchCancel', function({touches}) {
  printXY('touchCancel', touches);
  tabris.ui.contentView.background = 'red';
}).on('longpress', function({touches}) {
  tabris.ui.contentView.background = 'blue';
  printXY('longpress', touches);
});

function printXY(prefix, touches) {
  textView.text = prefix + ': ' + Math.round(touches[0].x) + ' X ' + Math.round(touches[0].y);
}

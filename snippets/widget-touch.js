const {TextView, ui} = require('tabris');

let textView = new TextView({
  left: 20, top: 20, right: 20,
  text: 'Touch anywhere...'
}).appendTo(ui.contentView);

ui.contentView.on({
  touchStart: ({touches}) => {
    printXY('touchStart', touches);
    ui.contentView.background = 'yellow';
  },
  touchMove: ({touches}) => printXY('touchMove', touches),
  touchEnd: ({touches}) => {
    printXY('touchEnd', touches);
    ui.contentView.background = 'green';
  },
  touchCancel: ({touches}) => {
    printXY('touchCancel', touches);
    ui.contentView.background = 'red';
  },
  longpress: ({touches}) => {
    ui.contentView.background = 'blue';
    printXY('longpress', touches);
  }
});

function printXY(prefix, touches) {
  textView.text = prefix + ': ' + Math.round(touches[0].x) + ' X ' + Math.round(touches[0].y);
}

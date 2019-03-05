import {TextView, contentView} from 'tabris';

const textView = new TextView({
  left: 20, top: 20, right: 20,
  text: 'Touch anywhere...'
}).appendTo(contentView);

contentView
  .onTouchStart(({touches}) => {
    printXY('touchStart', touches);
    contentView.background = 'yellow';
  })
  .onTouchMove(({touches}) => printXY('touchMove', touches))
  .onTouchEnd(({touches}) => {
    printXY('touchEnd', touches);
    contentView.background = 'green';
  })
  .onTouchCancel(({touches}) => {
    printXY('touchCancel', touches);
    contentView.background = 'red';
  })
  .onLongPress(({touches}) => {
    contentView.background = 'blue';
    printXY('longPress', touches);
  });

function printXY(prefix, touches) {
  textView.text = prefix + ': ' + Math.round(touches[0].x) + ' X ' + Math.round(touches[0].y);
}

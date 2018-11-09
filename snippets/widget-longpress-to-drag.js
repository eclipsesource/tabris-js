import {Composite, TextView, ui} from 'tabris';

const LABEL_TEXT = 'Long press the box to drag it';

let previousTouch;
let drag;

const composite = new Composite({centerX: 0, centerY: 0, width: 100, height: 100, background: 'red'})
  .appendTo(ui.contentView)
  .once('longpress', () => label.dispose())
  .on('longpress', ({state}) => {
    if (state === 'start') {
      enableDrag();
    }
  })
  .on('touchStart', ({touches: [touch]}) => previousTouch = touch)
  .on('touchMove', ({target, touches: [touch]}) => {
    if (!drag) {
      return;
    }
    target.transform = {
      translationX: touch.absoluteX - previousTouch.absoluteX + target.transform.translationX,
      translationY: touch.absoluteY - previousTouch.absoluteY + target.transform.translationY
    };
    previousTouch = touch;
  })
  .on('touchEnd', () => {
    previousTouch = null;
    disableDrag();
  });

const label = new TextView({
  centerX: 0, top: [composite, 8],
  text: LABEL_TEXT
}).appendTo(ui.contentView);

function enableDrag() {
  drag = true;
  composite.background = 'green';
}

function disableDrag() {
  drag = false;
  composite.background = 'red';
}

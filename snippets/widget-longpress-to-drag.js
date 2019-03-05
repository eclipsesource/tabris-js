import {Composite, TextView, contentView} from 'tabris';

const LABEL_TEXT = 'Long press the box to drag it';

let previousTouch;
let drag;

const composite = new Composite({centerX: 0, centerY: 0, width: 100, height: 100, background: 'red'})
  .appendTo(contentView)
  .onLongPress.once(() => label.dispose())
  .onLongPress(({state}) => {
    if (state === 'start') {
      enableDrag();
    }
  })
  .onTouchStart(({touches: [touch]}) => previousTouch = touch)
  .onTouchMove(({target, touches: [touch]}) => {
    if (!drag) {
      return;
    }
    target.transform = {
      translationX: touch.absoluteX - previousTouch.absoluteX + target.transform.translationX,
      translationY: touch.absoluteY - previousTouch.absoluteY + target.transform.translationY
    };
    previousTouch = touch;
  })
  .onTouchEnd(() => {
    previousTouch = null;
    disableDrag();
  });

const label = new TextView({
  centerX: 0, top: [composite, 8],
  text: LABEL_TEXT
}).appendTo(contentView);

function enableDrag() {
  drag = true;
  composite.background = 'green';
}

function disableDrag() {
  drag = false;
  composite.background = 'red';
}

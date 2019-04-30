import {TextView, contentView, drawer} from 'tabris';

drawer.set({enabled: true});
drawer.onOpen(() => console.log('drawer opened'));
drawer.onClose(() => console.log('drawer closed'));
const arrow = String.fromCharCode(8592);

contentView.append(
  <TextView left={10} centerY font='22px Arial' onTap={() => drawer.open()}>
    {arrow} Swipe from left or tap here
  </TextView>
);

drawer.append(
  <TextView left={10} centerY font='22px Arial' onTap={() => drawer.close()}>
    Thank you!
  </TextView>
);

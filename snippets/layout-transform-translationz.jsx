import {Composite, TextView, contentView} from 'tabris';

const RAISED = {transform: {translationZ: 4}};
const PRESSED = {transform: {translationZ: 16}};

contentView.append(
  <$>
    <Composite centerX top={64} width={200} height={200} background='white' {...RAISED}
        onTouchStart={ev => ev.target.animate(PRESSED, {duration: 100})}
        onTouchEnd={ev => ev.target.animate(RAISED, {duration: 200})}>
      <TextView center font='bold 16px'>Tap to elevate</TextView>
    </Composite>
  </$>
);

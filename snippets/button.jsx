import {Button, contentView} from 'tabris';

let count = 0;

contentView.append(
  <Button onSelect={countUp} left={16} top={16}>Button</Button>
);

function countUp() {
  $(Button).set({text: `Pressed ${++count} times`});
}

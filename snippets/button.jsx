import {Button, contentView} from 'tabris';

let count = 0;

contentView.append(
  <Button onSelect={countUp} left={10} top={10}>Button</Button>
);

function countUp() {
  $(Button).set({text: `Pressed ${++count} times`});
}

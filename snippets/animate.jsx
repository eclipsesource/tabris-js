import {Button, contentView, Stack, TextView} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16}>
    <Button text='Animate' onSelect={playAnimation}/>
    <TextView background='#6aa' textColor='white' font='20px' text='Hello World!'/>
  </Stack>
);

async function playAnimation() {
  $(Button).only().enabled = false;
  await $(TextView).only().animate({
    opacity: 0.25,
    transform: {
      rotation: 0.75 * Math.PI,
      scaleX: 2.0,
      scaleY: 2.0,
      translationX: 100,
      translationY: 200
    }
  }, {
    delay: 0,
    duration: 1000,
    repeat: 1,
    reverse: true,
    easing: 'ease-out'
  });
  $(Button).only().enabled = true;
}

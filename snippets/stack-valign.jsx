import {contentView, TextView, Stack} from 'tabris';

contentView.append(
  <Stack stretch alignment='stretchX'>
    <TextView background='red'>Top</TextView>
    <TextView stretchY background='green'>Stretch</TextView>
    <TextView background='teal'>Bottom</TextView>
  </Stack>
);

$(TextView).set({textColor: 'white', font: '48px'});

import {TextView, contentView, Stack} from 'tabris';

contentView.append(
  <Stack stretch padding={10} spacing={10} alignment='stretchX'>
    <TextView text='Left' alignment='left'/>
    <TextView text='Center' alignment='centerX'/>
    <TextView text='Right' alignment='right'/>
  </Stack>
);

import {TextView, contentView, Stack} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <TextView text='Left' alignment='left'/>
    <TextView text='Center' alignment='centerX'/>
    <TextView text='Right' alignment='right'/>
  </Stack>
);

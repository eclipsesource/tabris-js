import {contentView, TextView, Stack} from 'tabris';

contentView.append(
  <Stack layoutData='fill' alignment='stretchX'>
    <TextView top={0} background='red'>Top</TextView>
    <TextView top={0} bottom={0} background='green'>Stretch</TextView>
    <TextView bottom={0} background='teal'>Bottom</TextView>
  </Stack>
).find(TextView).set({textColor: 'white', font: '48px'});

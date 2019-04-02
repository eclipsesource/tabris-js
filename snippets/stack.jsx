import {contentView, TextView, Stack} from 'tabris';

contentView.append(
  <Stack layoutData='stretch' spacing={24} >
    <TextView background='red'>lorem</TextView>
    <TextView height={300} background='green'>ipsum dolor</TextView>
    <TextView width={300} top={50} background='blue'>sit amet</TextView>
    <TextView top={0} background='teal'>consectetur</TextView>
  </Stack>
).find(TextView).set({font: '48px', textColor: 'white'});

import {contentView, TextView, StackComposite} from 'tabris';

contentView.append(
  <StackComposite layoutData='fill' spacing={24} >
    <TextView background='red'>lorem</TextView>
    <TextView height={300} background='green'>ipsum dolor</TextView>
    <TextView width={300} bottom={24} background='blue'>sit amet</TextView>
    <TextView top={24} background='teal'>consectetur</TextView>
  </StackComposite>
).find(TextView).set({font: '48px', textColor: 'white'});

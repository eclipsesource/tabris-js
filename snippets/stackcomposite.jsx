import {contentView, TextView, StackComposite} from 'tabris';

contentView.append(
  <StackComposite layoutData='fill' spacing={24} >
    <TextView background='red'>lorem</TextView>
    <TextView height={300} background='green'>ipsum dolor</TextView>
    <TextView width={300} background='blue'>sit amet</TextView>
  </StackComposite>
).find(TextView).set({font: '48px', textColor: 'white'});

import {contentView, TextView, StackComposite} from 'tabris';

contentView.append(
  <StackComposite alignment='left' padding={8} spacing={4}>
    <TextView background='red'>lorem</TextView>
    <TextView background='green'>ipsum dolor</TextView>
    <TextView background='blue'>sit amet</TextView>
  </StackComposite>
).find(TextView).set({font: '48px', textColor: 'white'});

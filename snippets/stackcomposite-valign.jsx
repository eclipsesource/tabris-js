import {contentView, TextView, StackComposite} from 'tabris';

contentView.append(
  <StackComposite layoutData='fill' alignment='stretchX'>
    <TextView top={0} background='red'>Top</TextView>
    <TextView top={0} bottom={0} background='green'>Stretch</TextView>
    <TextView bottom={0} background='teal'>Bottom</TextView>
  </StackComposite>
).find(TextView).set({textColor: 'white', font: '48px'});

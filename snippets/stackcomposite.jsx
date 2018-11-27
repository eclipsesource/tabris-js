import {contentView, TextView, StackComposite} from 'tabris';

contentView.append(
  <StackComposite layoutData='fill' padding={8} spacing={4}>
    <TextView font='64px' background='red'>Hello World</TextView>
    <TextView font='64px' background='green'>Hello World</TextView>
    <TextView font='64px' background='blue'>Hello World</TextView>
  </StackComposite>
);

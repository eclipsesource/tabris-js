import {contentView, TextView, StackLayout, StackLayout, ScrollView} from 'tabris';

contentView.append(
  <ScrollView layoutData='fill' layout={new StackLayout({alignment: 'stretchX'})} >
    <TextView background='red'>lorem</TextView>
    <TextView background='green'>ipsum dolor</TextView>
    <TextView background='blue'>sit amet</TextView>
  </ScrollView>
).find(TextView).set({font: '48px', textColor: 'white'});

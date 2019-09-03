import {contentView, TextView, RowLayout, ScrollView} from 'tabris';

contentView.append(
  <ScrollView stretchX height={72} direction='horizontal'
      layout={new RowLayout({alignment: 'stretchY'})}>
    <TextView background='red'> lorem </TextView>
    <TextView background='green'> ipsum dolor </TextView>
    <TextView background='blue'> sit amet </TextView>
  </ScrollView>
).find(TextView).set({font: '36px', textColor: 'white'});

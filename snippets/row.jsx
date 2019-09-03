import {contentView, TextView, Row} from 'tabris';

contentView.append(
  <Row stretchX height={120} spacing={24} background='gray'>
    <TextView background='red'> lorem </TextView>
    <TextView width={100} background='green'> ipsum </TextView>
    <TextView height={100} left={50} background='blue'> dolor </TextView>
    <TextView left={0} background='teal'> sit amet </TextView>
  </Row>
).find(TextView).set({font: '24px', textColor: 'white'});

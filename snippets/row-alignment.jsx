import {contentView, TextView, Row, Button} from 'tabris';

contentView.append(
  <Row stretchX height={80} spacing={12} alignment='stretchY' background='gray'>
    <TextView background='red'> lorem </TextView>
    <TextView top background='green'> ipsum </TextView>
    <TextView bottom background='blue'> dolor </TextView>
    <TextView centerY background='teal'> sit </TextView>
    <Button baseline='prev()' background='fuchsia'> amet </Button>
  </Row>
).find(TextView).set({font: '24px', textColor: 'white'});

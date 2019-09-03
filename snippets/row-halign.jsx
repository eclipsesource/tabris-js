import {contentView, TextView, Row} from 'tabris';

contentView.append(
  <Row stretchX height={80} alignment='stretchY'>
    <TextView background='red'> Left </TextView>
    <TextView stretchX alignment='centerX' background='green'> Stretch </TextView>
    <TextView background='teal'> Right </TextView>
  </Row>
);

$(TextView).set({textColor: 'white', font: '24px'});

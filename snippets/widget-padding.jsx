import {Composite, TextView, contentView} from 'tabris';

contentView.append(
  <Composite padding={16} background='red'>
    <Composite padding={{top: 10, right: 16, bottom: 50, left: 20}} background='green'>
      <TextView padding={[0, 20, 20, 0]} background='yellow'>Tabris.js</TextView>
    </Composite>
  </Composite>
);

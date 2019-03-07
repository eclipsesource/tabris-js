import {Composite, TextView, contentView} from 'tabris';

contentView.append(
  <Composite padding={8} background='red'>
    <Composite padding={16} background='green' >
      <TextView padding={32} background='yellow' >Tabris.js</TextView>
    </Composite>
  </Composite>
);

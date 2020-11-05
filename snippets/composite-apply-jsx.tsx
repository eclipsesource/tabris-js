import {Composite, TextView, contentView, Apply} from 'tabris';

contentView.append(
  <Composite padding={8}>
    <Apply target={TextView}>
      {{
        top: 'prev() 10',
        background: '#66E',
        textColor: 'white',
        font: '24px'
      }}
    </Apply>
    <TextView>Hello</TextView>
    <TextView>Blue</TextView>
    <TextView>World</TextView>
  </Composite>
);

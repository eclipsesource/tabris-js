import {Composite, TextView, contentView, Setter, Apply} from 'tabris';

contentView.append(
  <Composite padding={8}>
    <Apply>
      {{
        TextView: Setter(TextView, {
          top: 'prev() 10',
          background: '#66E',
          textColor: 'white',
          font: '24px'
        })
      }}
    </Apply>
    <TextView>Hello</TextView>
    <TextView>Blue</TextView>
    <TextView>World</TextView>
  </Composite>
);

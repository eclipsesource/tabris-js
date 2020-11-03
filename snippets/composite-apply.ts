import {Composite, TextView, contentView, Setter} from 'tabris';

contentView.append(
  Composite({
    padding: 8,
    apply: {
      TextView: Setter(TextView, {
        top: 'prev() 10',
        background: '#66E',
        textColor: 'white',
        font: '24px'
      })
    },
    children: [
      TextView({text: 'Hello'}),
      TextView({text: 'Blue'}),
      TextView({text: 'World'})
    ]
  })
);

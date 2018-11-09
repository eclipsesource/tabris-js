import {Button, ScrollView, TextView, ui} from 'tabris';

// Create a horizontal scroll view and populate it with text views

const scrollView = new ScrollView({
  left: 0, right: 0, top: '40%', bottom: '40%',
  direction: 'horizontal',
  background: '#234'
}).appendTo(ui.contentView);

for (let i = 0; i <= 50; i++) {
  new TextView({
    left: i * 30 + 20, centerY: 0, width: 30,
    textColor: 'white',
    text: i + '°'
  }).appendTo(scrollView);
}

new Button({
  left: 16, bottom: 16,
  text: 'scroll'
}).on('select', () => scrollView.scrollToX(310))
  .appendTo(ui.contentView);

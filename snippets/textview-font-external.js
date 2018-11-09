import {ScrollView, TextView, ui, app} from 'tabris';

app.registerFont('pacifico', 'resources/pacifico.ttf#Pacifico');

const scrollView = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

const font = '20px pacifico';
new TextView({
  left: 16, top: 'prev() 24', right: 16,
  text: font
}).appendTo(scrollView);

new TextView({
  left: 16, top: 'prev() 8', right: 16,
  text: 'Sphinx of black quartz, judge my vow. Sphinx of black quartz, judge my vow. Sphinx of black quartz...',
  font
}).appendTo(scrollView);

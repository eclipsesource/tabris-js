import {ScrollView, TextView, contentView} from 'tabris';

const FAMILIES = ['sans-serif', 'serif', 'condensed', 'monospace'];
const STYLES = ['normal', 'italic'];
const WEIGHTS =  ['thin', 'light', 'normal', 'medium', 'bold', 'black'];

const scrollView = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

for (const style of STYLES) {
  for (const family of FAMILIES) {
    for (const weight of WEIGHTS) {
      const font = style + ' ' + weight + ' 24px ' + family;
      new TextView({
        left: 16, top: 'prev() 24', right: 16,
        text: font
      }).appendTo(scrollView);
      new TextView({
        left: 16, top: 'prev() 8', right: 16,
        text: 'Sphinx of black quartz, judge my vow',
        font
      }).appendTo(scrollView);
    }
  }
}

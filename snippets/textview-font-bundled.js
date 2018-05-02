import {ScrollView, TextView, ui} from 'tabris';

let FAMILIES = ['sans-serif', 'serif', 'condensed', 'monospace'];
let STYLES = ['normal', 'italic'];
let WEIGHTS =  ['thin', 'light', 'normal', 'medium', 'bold', 'black'];

let scrollView = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(ui.contentView);

for (let style of STYLES) {
  for (let family of FAMILIES) {
    for (let weight of WEIGHTS) {
      let font = weight + ' ' + style + ' 24px ' + family;
      new TextView({
        left: 16, top: 'prev() 24', right: 16,
        text: font
      }).appendTo(scrollView);
      new TextView({
        left: 16, top: 'prev() 8', right: 16,
        text: 'Sphinx of black quartz, judge my vow',
        font: font
      }).appendTo(scrollView);
    }
  }
}

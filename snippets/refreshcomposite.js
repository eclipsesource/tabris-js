import {RefreshComposite, CheckBox, ScrollView, TextView, contentView} from 'tabris';

const refreshComposite = new RefreshComposite({
  left: 0, right: 0, top: 0, bottom: 0
}).onRefresh(({target}) => setTimeout(() => {
  target.refreshIndicator = false;
  textView.text = `last refresh: ${new Date()}\n${textView.text}`;
}, 1000)).appendTo(contentView);

const scrollView = new ScrollView({
  left: 0, right: 0, top: 0, bottom: 0
}).appendTo(refreshComposite);

new TextView({
  left: 0, right: 0, top: 32,
  alignment: 'center',
  font: 'black 24px',
  text: 'pull to refresh'
}).appendTo(scrollView);

const textView = new TextView({
  left: 0, right: 0, top: 'prev() 32',
  alignment: 'center',
  lineSpacing: 1.4
}).appendTo(scrollView);

new CheckBox({
  left: 16, right: 16, bottom: 16,
  text: 'Enable pull to refresh',
  checked: true
}).onCheckedChanged(({value: checked}) => refreshComposite.refreshEnabled = checked)
  .appendTo(contentView);

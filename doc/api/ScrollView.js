import {ScrollView, TextView, contentView} from 'tabris';

const scrollView = new ScrollView({layoutData: 'stretch'})
  .appendTo(contentView);

new TextView({text: 'Scrollable content'})
  .appendTo(scrollView);

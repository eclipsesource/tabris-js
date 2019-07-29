import {NavigationView, Page, contentView} from 'tabris';

new NavigationView({layoutData: 'stretch'})
  .append(new Page({title: 'Albums'}))
  .appendTo(contentView);

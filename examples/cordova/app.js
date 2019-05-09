const {Button, Page, NavigationView, ScrollView, contentView} = require('tabris');
const ToastPage = require('./ToastPage');
const SharingPage = require('./SharingPage');
const MotionPage = require('./MotionPage');
const NetworkPage = require('./NetworkPage');
const MediaPage = require('./MediaPage');
const CameraPage = require('./CameraPage');

const navigationView = new NavigationView({left: 0, top: 0, right: 0, bottom: 0})
  .appendTo(contentView);

const mainPage = new Page({
  title: 'Cordova Examples'
}).appendTo(navigationView);

const contentContainer = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0, padding: 16
}).appendTo(mainPage);

[
  SharingPage,
  ToastPage,
  MotionPage,
  NetworkPage,
  CameraPage,
  MediaPage
].forEach(Page => {
  const page = new Page();
  addPageSelector(page);
});

function addPageSelector(page) {
  new Button({
    left: 0, top: 'prev() 8', right: 0,
    text: page.title
  }).on('select', () => page.appendTo(navigationView))
    .appendTo(contentContainer);
}

const {Button, Page, NavigationView, ScrollView, ui} = require('tabris');
const ToastPage = require('./ToastPage');
const SharingPage = require('./SharingPage');
const MotionPage = require('./MotionPage');
const NetworkPage = require('./NetworkPage');
const MediaPage = require('./MediaPage');
const CameraPage = require('./CameraPage');
const BarcodeScannerPage = require('./BarcodeScannerPage');

const navigationView = new NavigationView({left: 0, top: 0, right: 0, bottom: 0})
  .appendTo(ui.contentView);

const mainPage = new Page({
  title: 'Cordova Examples'
}).appendTo(navigationView);

const contentContainer = new ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(mainPage);

[
  SharingPage,
  ToastPage,
  MotionPage,
  NetworkPage,
  CameraPage,
  BarcodeScannerPage,
  MediaPage
].forEach(Page => {
  const page = new Page();
  addPageSelector(page);
});

function addPageSelector(page) {
  new Button({
    left: 16, top: 'prev() 8', right: 16,
    text: page.title
  }).on('select', () => page.appendTo(navigationView))
    .appendTo(contentContainer);
}


var navigationView = new tabris.NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(tabris.ui.contentView);

var mainPage = new tabris.Page({
  title: 'Cordova Examples'
}).appendTo(navigationView);

var contentContainer = new tabris.ScrollView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(mainPage);

[
  './modules/SharingPage',
  './modules/ToastPage',
  './modules/MotionPage',
  './modules/NetworkPage',
  './modules/CameraPage',
  './modules/BarcodeScannerPage',
  './modules/MediaPage',
  './modules/ActionSheetPage'
].forEach(function(page) {
  addPageSelector(require(page).create().page);
});

function addPageSelector(page) {
  new tabris.Button({
    left: 16, top: ['prev()', 16], right: 16,
    text: page.title
  }).on('select', function() {
    page.appendTo(navigationView);
  }).appendTo(contentContainer);
}

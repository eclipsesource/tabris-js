[
  './modules/SharingPage',
  './modules/ToastPage',
  './modules/MotionPage',
  './modules/DialogPage',
  './modules/NetworkPage',
  './modules/CameraPage',
  './modules/BarcodeScannerPage',
  './modules/MediaPage',
  './modules/ActionSheetPage'
].forEach(function(page) {
  require(page).create();
});

new tabris.Drawer().append(new tabris.PageSelector());
tabris.ui.children('Page')[0].open();

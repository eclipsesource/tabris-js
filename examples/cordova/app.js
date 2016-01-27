[
  "./modules/ToastPage",
  "./modules/BadgePage",
  "./modules/MotionPage",
  "./modules/DialogPage",
  "./modules/NetworkPage",
  "./modules/CameraPage",
  "./modules/BarcodeScannerPage"
].forEach(function(page) {
  require(page).create();
});

tabris.create("Drawer").append(tabris.create("PageSelector"));
tabris.ui.children("Page")[0].open();

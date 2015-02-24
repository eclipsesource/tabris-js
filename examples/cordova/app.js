var pages = [
  "./modules/ToastPage",
  "./modules/BadgePage",
  "./modules/MotionPage",
  "./modules/DialogPage",
  "./modules/NetworkPage",
  "./modules/CameraPage",
  "./modules/BarcodeScannerPage"
];

require(pages[0]).create().open();

for (var i = 1; i < pages.length; i++) {
  require(pages[i]).create();
}

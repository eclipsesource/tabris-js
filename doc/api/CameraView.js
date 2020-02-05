import {CameraView, contentView, device} from 'tabris';

const camera = device.cameras[0];
camera.active = true;

new CameraView({
  layoutData: 'stretch',
  camera
}).appendTo(contentView);

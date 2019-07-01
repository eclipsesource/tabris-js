import {CameraView, contentView, device} from 'tabris';

const camera = device.cameras[0];
camera.active = true;

contentView.append(
  <CameraView stretch camera={camera}/>
);

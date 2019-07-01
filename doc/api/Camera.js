import {device} from 'tabris';

const camera = device.cameras[0];
camera.active = true;

camera.captureImage()
  .then(({image}) => console.log(`Captured image with size ${image.size}.`));

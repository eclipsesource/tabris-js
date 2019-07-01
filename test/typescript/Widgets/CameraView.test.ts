import { Camera, CameraView, Properties } from 'tabris';

let widget: CameraView = new CameraView();

// Properties
let camera: Camera;
let scaleMode: 'fill' | 'fit';

scaleMode = widget.scaleMode;
camera = widget.camera;

widget.scaleMode = scaleMode;
widget.camera = camera;

let properties: Properties<CameraView> = {
  camera,
  scaleMode
};

widget = new CameraView(properties);
widget.set(properties);

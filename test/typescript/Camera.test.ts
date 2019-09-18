import { Camera, device } from 'tabris';

type Resolution = {width: number, height: number};

const camera: Camera = device.cameras[0];
const resolution: Resolution|null = camera.captureResolution;
const resolutions: Resolution[] = camera.availableCaptureResolutions;
camera.captureResolution = resolution;
const position: 'front' | 'back' | 'external' = camera.position;
const cameraId: string = camera.cameraId;
const active: boolean = camera.active;
camera.active = active;
const flash: 'auto' | 'on' | 'off' = 'on';

const capture: Promise<Resolution & {image: Blob}> = camera.captureImage({flash});

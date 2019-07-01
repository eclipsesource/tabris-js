import {
  Button,
  Camera,
  CameraView,
  Composite,
  contentView,
  device,
  fs,
  ImageView,
  permission,
  Picker,
  PickerSelectEvent,
  ScrollView,
  Stack,
  TextView
} from 'tabris';

const scaleModes: Array<'fit' | 'fill'> = ['fit', 'fill'];

let camera: Camera = device.cameras[0];

permission.withAuthorization('camera',
  () => camera.active = true,
  () => console.log('"camera" permission is required.'),
  (e) => console.error(e)
);

contentView.append(
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <CameraView top bottom={16} background='#dddddd' camera={camera}/>
    <ScrollView height={128} direction='horizontal' background='#dddddd'>
      <Composite id='imageStrip' padding={{top: 16, bottom: 0, right: 16}}
        onResize={({width}) => $(ScrollView).only().scrollToX(width)}/>
    </ScrollView>
    <Picker message='Camera'
      itemCount={device.cameras.length}
      itemText={index => device.cameras[index].position}
      selectionIndex={0}
      onSelect={cameraSelected}/>
    <Picker
      message='Scale mode'
      itemCount={scaleModes.length}
      itemText={index => scaleModes[index]}
      selectionIndex={0}
      onSelect={e => $(CameraView).only().scaleMode = scaleModes[e.index]}/>
    <Picker id='resolution'
      message='Capture resolution'
      onSelect={({index}) => camera.captureResolution = camera.availableCaptureResolutions[index]}/>
    <Button text='Take picture' onSelect={captureImage}/>
  </Stack>
);

populateResolutionPicker(camera);

function cameraSelected({index}: PickerSelectEvent<Picker>) {
  camera.active = false;
  camera = device.cameras[index];
  camera.active = true;
  $(CameraView).only().camera = camera;
  populateResolutionPicker(camera);
}

function populateResolutionPicker(sourceCamera: Camera) {
  const resolutions = sourceCamera.availableCaptureResolutions;
  $('#resolution').only(Picker).set({
    itemCount: resolutions.length,
    selectionIndex: resolutions.length - 1,
    itemText: (index) => getResolution(sourceCamera.availableCaptureResolutions[index])
  });
  sourceCamera.captureResolution = sourceCamera.availableCaptureResolutions[resolutions.length - 1];
}

async function captureImage() {
  const image = await camera.captureImage({flash: 'auto'});
  const imagePath = `${fs.cacheDir}/picture-${new Date().getTime()}.jpg`;
  await fs.writeFile(imagePath, image.image);
  $('#imageStrip').only(Composite).append(
    <Stack height={112} left='prev() 16' alignment='centerX' spacing={8}>
      <ImageView height={80} image={{src: imagePath, width: 80, height: 80}}/>
      <TextView text={getResolution(image)} font='12px'/>
    </Stack>
  );
}

function getResolution(size: {width: number, height: number}) {
  return `${size.width} x ${size.height}`;
}

import {Button, CameraView, contentView, device, fs, ImageView, permission, Popover, Stack} from 'tabris';

const camera = device.cameras[0];
const resolutions = camera.availableCaptureResolutions;
camera.captureResolution = resolutions[resolutions.length - 1];

permission.withAuthorization('camera',
  () => camera.active = true,
  () => console.log('"camera" permission is required.'),
  (e) => console.error(e));

contentView.append(
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <CameraView top bottom={16} background='#dddddd' camera={camera}/>
    <Button text='Take picture' onSelect={captureImage}/>
  </Stack>
);

async function captureImage() {
  const image = await camera.captureImage({flash: 'auto'});
  const imagePath = `${fs.cacheDir}/picture-${new Date().getTime()}.jpg`;
  await fs.writeFile(imagePath, image.image);
  const popover = Popover.open(
    <Popover width={400} height={300}>
      <ImageView stretch background='black' image={imagePath} zoomEnabled={true}/>
      <ImageView left={16} top={16} image='resources/close-white-24dp@3x.png'
        onTap={() => popover.close()}/>
    </Popover>
  );
}

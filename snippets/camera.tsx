import {app, Button, CameraView, contentView, device, ImageView, permission, Popover, Stack} from 'tabris';

app.idleTimeoutEnabled = false;
const camera = device.cameras[0];

permission.withAuthorization('camera',
  () => camera.set({active: true, priority: 'performance'}),
  () => console.log('"camera" permission is required.'),
  (e) => console.error(e)
);
contentView.append(
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <CameraView top bottom={16} background='#dddddd' camera={camera}/>
    <Button text='Take picture' onSelect={captureImage}/>
  </Stack>
);

async function captureImage() {
  const capturedImage = await camera.captureImage({flash: 'auto'});
  const popover = Popover.open(
    <Popover width={400} height={300}>
      <ImageView stretch background='black' image={capturedImage.image} zoomEnabled/>
      <ImageView left={16} top={16} image='resources/close-white-24dp@3x.png'
          onTap={() => popover.close()}/>
    </Popover>
  );
}

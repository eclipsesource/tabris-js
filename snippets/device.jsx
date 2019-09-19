import {contentView, device, TextView} from 'tabris';

contentView.append(<TextView padding={16} markupEnabled font={'16px'} lineSpacing={1.4}/>);

device.onOrientationChanged(renderDeviceProperties);
renderDeviceProperties();

function renderDeviceProperties() {
  $(TextView).only().text =
    <$>
      <b>Platform:</b> {device.platform}<br/>
      <b>Version:</b> {device.version}<br/>
      <b>Model:</b> {device.model}<br/>
      <b>Vendor:</b> {device.vendor}<br/>
      <b>Name:</b> {device.name}<br/>
      <b>Language:</b> {device.language}<br/>
      <b>Orientation:</b> {device.orientation}<br/>
      <b>Screen:</b> {device.screenWidth} x {device.screenHeight}<br/>
      <b>Scale:</b> {device.scaleFactor}<br/>
      <b>Cameras:</b> {device.cameras ? device.cameras.map(camera => camera.position) : 'none'}<br/>
    </$>
  ;
}

import {TextView, device, contentView} from 'tabris';

const label = new TextView({padding: 16, markupEnabled: true, font: '16px', lineSpacing: 1.4})
  .appendTo(contentView);

device.onOrientationChanged(render);
render();

function render() {
  label.text =
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
    </$>
  ;
}

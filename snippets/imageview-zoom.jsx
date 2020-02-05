import {CheckBox, Composite, contentView, ImageView, Slider, Stack, TextView} from 'tabris';

contentView.append(
  <Stack stretch alignment='stretchX'>
    <ImageView stretchY zoomEnabled image='resources/salad.jpg' background='#f5f5f5'
        onZoom={ev => zoomLevelSlider.selection = ev.zoomLevel * 10}/>
    <Stack height={device.platform === 'iOS' ? 196 : undefined} alignment='stretchX'
        padding={{bottom: 12, top: 12}} background='white' elevation={8}>
      <CheckBox left={device.platform === 'iOS' ? 16 : 9} height={48} stretchX checked text='Zoom enabled'
          onCheckedChanged={ev => setZoomEnabled(ev.value)}/>
      <LabeledSlider id='zoomLevel' text='Zoom level' selection={10}
          onSelectionChanged={ev => setZoomLevel(ev.value / 10)}/>
      <LabeledSlider id='minZoomLevel' text='Min zoom' selection={10}
          onSelectionChanged={ev => setMinZoomLevel(ev.value / 10)}/>
      <LabeledSlider id='maxZoomLevel' text='Max zoom' selection={30}
          onSelectionChanged={ev => setMaxZoomLevel(ev.value / 10)}/>
    </Stack>
  </Stack>
);

const imageView = $(ImageView).only();
const zoomLevelSlider = $(Slider).only('#zoomLevel');
const minZoomSlider = $(Slider).only('#minZoomLevel');
const maxZoomSlider = $(Slider).only('#maxZoomLevel');

/** @param {boolean} value */
function setZoomEnabled(value) {
  imageView.zoomEnabled = value;
  $(LabeledSlider).set({enabled: value});
}

/** @param {number} value */
function setZoomLevel(value) {
  if (imageView.zoomEnabled && value >= imageView.minZoomLevel && value <= imageView.maxZoomLevel) {
    imageView.zoomLevel = value;
  }
}

/** @param {number} value */
function setMinZoomLevel(value) {
  if (maxZoomSlider.selection < value * 10) {
    maxZoomSlider.selection = value * 10;
  }
  if (zoomLevelSlider.selection < value * 10) {
    zoomLevelSlider.selection = value * 10;
  }
  if (imageView.zoomEnabled) {
    imageView.minZoomLevel = value;
  }
}

/** @param {number} value */
function setMaxZoomLevel(value) {
  if (minZoomSlider.selection > value * 10) {
    minZoomSlider.selection = value * 10;
  }
  if (zoomLevelSlider.selection > value * 10) {
    zoomLevelSlider.selection = value * 10;
  }
  if (imageView.zoomEnabled) {
    imageView.maxZoomLevel = value;
  }
}

/** @param {tabris.Attributes<Slider> & {text: string}} attributes */
function LabeledSlider({text, ...attributes}) {
  const container = /** @type {Composite} */ (
    <Composite height={40} padding={[0, 16]}>
      <TextView left centerY width={72} text={text}/>
      <Slider left='prev() 16' right={40} centerY minimum={5} maximum={50} {...attributes}/>
      <TextView right centerY alignment='right' text={(attributes.selection / 10).toFixed(1)}/>
    </Composite>
  );
  container.find(Slider).only().onSelectionChanged(ev => {
    container.find(TextView).last().text = (ev.value / 10).toFixed(1);
  });
  return container;
}

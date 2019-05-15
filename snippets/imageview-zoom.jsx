import {ImageView, TextView, CheckBox, Slider, Composite, Stack, contentView, device} from 'tabris';

contentView.append(
  <Stack stretch alignment='stretchX'>
    <ImageView stretchY zoomEnabled image='resources/salad.jpg' background='#f5f5f5'
        onZoom={ev => zoomLevelSlider.selection = ev.zoomLevel * 10}/>
    <CheckBox left={16} top={16} stretchX checked text='Zoom enabled'
        onCheckedChanged={ev => setZoomEnabled(ev.value)}/>
    <LabeledSlider id='zoomLevel' text='Zoom level' selection={10}
        onSelectionChanged={ev => setZoomLevel(ev.value / 10)}/>
    <LabeledSlider id='minZoomLevel' text='Min zoom' selection={10}
        onSelectionChanged={ev => setMinZoomLevel(ev.value / 10)}/>
    <LabeledSlider id='maxZoomLevel' text='Max zoom' selection={30}
        onSelectionChanged={ev => setMaxZoomLevel(ev.value / 10)}/>
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
  if (imageView.zoomEnabled && value > imageView.minZoomLevel && value < imageView.maxZoomLevel) {
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
    <Composite padding={16}>
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

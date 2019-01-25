import {ImageView, TextView, CheckBox, Slider, Composite, contentView} from 'tabris';

const imageView = new ImageView({
  left: 0, right: 0, top: 0, bottom: '#controls',
  image: 'resources/salad.jpg',
  background: '#f5f5f5',
  zoomEnabled: true
}).on('zoom', ({zoomLevel}) => zoomLevelSlider.selection = zoomLevel * 10)
  .appendTo(contentView);

const controls = new Composite({
  id: 'controls',
  left: 0, right: 0, bottom: 0, height: tabris.device.platform === 'iOS' ? 204 : undefined,
  background: 'white',
  padding: {left: 16, right: 16, top: 16, bottom: 24},
  elevation: 8
}).appendTo(contentView);

new CheckBox({
  id: 'zoomEnabled',
  left: 0, right: 0, top: 0,
  checked: true,
  text: 'Zoom enabled'
}).on('checkedChanged', ({target: checkBox, value: zoomEnabled}) => {
  zoomLevelSlider.selection = 10;
  minZoomSlider.selection = 10;
  maxZoomSlider.selection = 30;
  imageView.zoomEnabled = zoomEnabled;
  controls.children().filter(widget => widget !== checkBox).set({enabled: zoomEnabled});
}).appendTo(controls);

const zoomLevelSlider = createSlider('Zoom level', imageView.zoomLevel * 10)
  .on('select', ({selection}) => {
    const zoomLevel = selection / 10;
    if (imageView.zoomEnabled && zoomLevel > imageView.minZoomLevel && zoomLevel < imageView.maxZoomLevel) {
      imageView.zoomLevel = zoomLevel;
    }
  });

const minZoomSlider = createSlider('Min zoom', imageView.minZoomLevel * 10)
  .on('selectionChanged', ({value: minZoomLevel}) => {
    if (maxZoomSlider.selection < minZoomLevel) {
      maxZoomSlider.selection = minZoomLevel;
    }
    if (zoomLevelSlider.selection < minZoomLevel) {
      zoomLevelSlider.selection = minZoomLevel;
    }
    if (imageView.zoomEnabled) {
      imageView.minZoomLevel = minZoomLevel / 10;
    }
  });

const maxZoomSlider = createSlider('Max zoom', imageView.maxZoomLevel * 10)
  .on('selectionChanged', ({value: maxZoomLevel}) => {
    if (minZoomSlider.selection > maxZoomLevel) {
      minZoomSlider.selection = maxZoomLevel;
    }
    if (zoomLevelSlider.selection > maxZoomLevel) {
      zoomLevelSlider.selection = maxZoomLevel;
    }
    if (imageView.zoomEnabled) {
      imageView.maxZoomLevel = maxZoomLevel / 10;
    }
  });

function createSlider(title, selection) {
  const container = new Composite({
    left: 0, top: 'prev() 16', right: 0
  }).appendTo(controls);

  new TextView({
    left: 0, width: 72, centerY: 0,
    text: title
  }).appendTo(container);

  const slider = new Slider({
    left: 'prev() 16', right: 40, centerY: 0,
    minimum: 5,
    maximum: 50,
    selection
  }).on('selectionChanged', ({value: level}) => sliderValue.text = (level / 10).toFixed(1))
    .appendTo(container);

  const sliderValue = new TextView({
    right: 0, centerY: 0,
    alignment: 'right',
    text: (slider.selection / 10).toFixed(1)
  }).appendTo(container);
  return slider;
}

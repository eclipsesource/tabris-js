const {ImageView, ScrollView, ui} = require('tabris');

const IMAGES = require('./images/index.json');
const IMAGE_SIZE = 96;

class FilmStrip extends ScrollView {

  constructor(properties) {
    super(properties);
    this.resetHideTimeout();
  }

  isShowing() {
    return this.transform.translationY === 0;
  }

  show() {
    this.animate({transform: {translationY: 0}}, {easing: 'ease-out'});
  }

  hide() {
    this.animate({transform: {translationY: this.bounds.height}}, {easing: 'ease-out'});
  }

  toggleShowing() {
    if (this.isShowing()) {
      this.hide();
    } else {
      this.show();
      this.resetHideTimeout();
    }
  }

  resetHideTimeout() {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.hide(), 4000);
  }
}

ui.contentView.background = 'black';
ui.statusBar.set({
  displayMode: 'float',
  theme: 'dark',
  background: '#00000044'
});

const fullImage = new ImageView({
  top: 0, bottom: 0, left: 0, right: 0,
  image: `images/${IMAGES[0]}`,
  scaleMode: 'fit',
  zoomEnabled: true
}).on('tap', () => filmStrip.toggleShowing())
  .appendTo(ui.contentView);

const filmStrip = new FilmStrip({
  left: 0, right: 0, bottom: 0, height: 112,
  direction: 'horizontal',
  background: '#00000044'
}).on('scrollX', () => filmStrip.resetHideTimeout())
  .appendTo(ui.contentView);

IMAGES.forEach((image) => {
  new ImageView({
    top: 8, left: 'prev() 8', width: IMAGE_SIZE, height: IMAGE_SIZE,
    image: {src: `images/${image}`, width: IMAGE_SIZE, height: IMAGE_SIZE},
    scaleMode: 'fill',
    highlightOnTouch: true
  }).on('tap', () => {
    fullImage.image = `images/${image}`;
    filmStrip.resetHideTimeout();
  }).appendTo(filmStrip);
});

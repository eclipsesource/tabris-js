const IMAGES = require('./images/index.json');
const IMAGE_SIZE = 96;

class FilmStrip extends tabris.ScrollView {

  constructor(properties) {
    super(properties);
    this.resetHideTimeout();
  }

  isShowing() {
    return this.transform.translationY === 0;
  }

  show() {
    this.animate({transform: {translationY: 0}});
  }

  hide() {
    this.animate({transform: {translationY: this.bounds.height}});
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
    this._timeout = setTimeout(() => filmStrip.hide(), 5000);
  }
}

tabris.ui.contentView.background = 'black';
tabris.ui.statusBar.set({
  displayMode: 'float',
  theme: 'dark',
  background: '#00000044'
});

const fullImage = new tabris.ImageView({
  top: 0, bottom: 0, left: 0, right: 0,
  image: {src: `images/${IMAGES[0]}`},
  scaleMode: 'fill'
}).on('tap', () => filmStrip.toggleShowing())
  .appendTo(tabris.ui.contentView);

const filmStrip = new FilmStrip({
  left: 0, right: 0, bottom: 0, height: 112,
  direction: 'horizontal',
  background: '#00000044'
}).on('scrollX', () => filmStrip.resetHideTimeout())
  .appendTo(tabris.ui.contentView);

IMAGES.forEach((image) => {
  new tabris.ImageView({
    top: 8, left: 'prev() 8', width: IMAGE_SIZE, height: IMAGE_SIZE,
    image: {src: `images/${image}`, width: IMAGE_SIZE, height: IMAGE_SIZE},
    scaleMode: 'fill',
    highlightOnTouch: true
  }).on('tap', function() {
    fullImage.image = {src: `images/${image}`};
    filmStrip.resetHideTimeout();
  }).appendTo(filmStrip);
});

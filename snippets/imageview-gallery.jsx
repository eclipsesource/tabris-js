import {contentView, ImageView, ScrollView, statusBar} from 'tabris';

const IMAGES = ['cover.jpg', 'salad.jpg', 'landscape.jpg', 'ian.jpg', 'target_200.png']
  .map((image) => `resources/${image}`);
const IMAGE_SIZE = 96;

class FilmStrip extends ScrollView {

  constructor(properties) {
    super({...properties, direction: 'horizontal'});
    this._timeout = null;
    this.resetHideTimeout();
  }

  isShowing() {
    return this.transform.translationY === 0;
  }

  show() {
    this.animate({transform: {translationY: 0}}, {easing: 'ease-out', duration: 150});
  }

  hide() {
    this.animate({transform: {translationY: this.bounds.height}}, {easing: 'ease-out', duration: 150});
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
    if (this._timeout !== null) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this.hide();
      this._timeout = null;
    }, 4000);
  }
}

contentView.background = '#292929';

statusBar.set({
  displayMode: 'float',
  theme: 'dark',
  background: '#00000044'
});

contentView.append(
  <$>
    <ImageView stretch zoomEnabled scaleMode='fit' image={IMAGES[0]}
      onTap={() => $(FilmStrip).only().toggleShowing()}/>
    <FilmStrip stretchX bottom height={112} background='#00000044'
      onScrollX={(e) => e.target.resetHideTimeout()}>
      {
        IMAGES.map((image) =>
          <ImageView top={8} left='prev() 8' width={IMAGE_SIZE} height={IMAGE_SIZE}
            highlightOnTouch image={{src: image, width: IMAGE_SIZE, height: IMAGE_SIZE}}
            scaleMode='fill' onTap={(e) => showImage(e.target.image)}/>)
      }
    </FilmStrip>
  </$>
);

function showImage(image) {
  $(ImageView).first().image = image.src;
  $(FilmStrip).only().resetHideTimeout();
}

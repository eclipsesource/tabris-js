import {
  contentView, EventObject, Image, ImageValue, ImageView, Properties, ScrollView, statusBar, checkType
} from 'tabris';

const IMAGES = ['cover.jpg', 'salad.jpg', 'landscape.jpg', 'ian.jpg', 'target_200.png']
  .map((image) => `resources/${image}`);
const IMAGE_SIZE = 96;

class FilmStrip extends ScrollView {

  private _timeout: null;

  constructor(properties: Properties<ScrollView>) {
    super({...properties, direction: 'horizontal'});
    this.resetHideTimeout();
  }

  public isShowing() {
    return this.transform.translationY === 0;
  }

  public show() {
    this.animate({transform: {translationY: 0}}, {easing: 'ease-out', duration: 150})
      .catch(ex => console.error(ex));
  }

  public hide() {
    this.animate({transform: {translationY: this.bounds.height}}, {easing: 'ease-out', duration: 150})
      .catch(ex => console.error(ex));
  }

  public toggleShowing() {
    if (this.isShowing()) {
      this.hide();
    } else {
      this.show();
      this.resetHideTimeout();
    }
  }

  public resetHideTimeout() {
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
              scaleMode='fill' onTap={(e: EventObject<ImageView>) => showImage(e.target.image)}/>
        )
      }
    </FilmStrip>
  </$>
);

function showImage(image: ImageValue) {
  $(ImageView).first().image = checkType(image, Image).src;
  $(FilmStrip).only().resetHideTimeout();
}

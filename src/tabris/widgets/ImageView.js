import NativeObject from '../NativeObject';
import Widget from '../Widget';

const EVENT_TYPES = ['load', 'zoom'];

export default class ImageView extends Widget {

  get _nativeType() {
    return 'tabris.ImageView';
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'zoomLevelChanged') {
      this._onoff('zoom', listening, this.$triggerChangeZoomLevel);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeZoomLevel({zoomLevel}) {
    this._triggerChangeEvent('zoomLevel', zoomLevel);
  }

}

NativeObject.defineProperties(ImageView.prototype, {
  image: {type: 'image', default: null},
  scaleMode: {type: ['choice', ['auto', 'fit', 'fill', 'stretch', 'none']], default: 'auto'},
  tintColor: {
    type: 'color',
    set(name, value) {
      this._nativeSet(name, value === undefined ? null : value);
      this._storeProperty(name, value);
    }
  },
  zoomEnabled: {
    type: 'boolean',
    default: false,
    set(name, value) {
      if (this.zoomEnabled !== value) {
        if (!value) {
          this.minZoomLevel = 1;
          this.maxZoomLevel = 3;
          this.zoomLevel = 1;
        }
        this._nativeSet(name, value);
        this._storeProperty(name, value);
      }
    }
  },
  zoomLevel: {
    type: 'number',
    nocache: true,
    set(name, value) {
      if (!this.zoomEnabled) {
        throw new Error('zoomLevel can not be set when zoomEnabled is false');
      }
      if (value < this.minZoomLevel) {
        throw new Error('zoomLevel can not be smaller than minZoomLevel');
      }
      if (value > this.maxZoomLevel) {
        throw new Error('zoomLevel can not be larger than maxZoomLevel');
      }
      this._nativeSet(name, value);
    }
  },
  minZoomLevel: {
    type: 'number',
    default: 1.0,
    set(name, value) {
      if (!this.zoomEnabled) {
        throw new Error('minZoomLevel can not be set when zoomEnabled is false');
      }
      if (value > this.maxZoomLevel) {
        throw new Error('minZoomLevel can not be larger than maxZoomLevel');
      }
      if (value > this.zoomLevel) {
        this.zoomLevel = value;
      }
      this._nativeSet(name, value);
      this._storeProperty(name, value);
    }
  },
  maxZoomLevel: {
    type: 'number',
    default: 3.0,
    set(name, value) {
      if (!this.zoomEnabled) {
        throw new Error('maxZoomLevel can not be set when zoomEnabled is false');
      }
      if (value < this.minZoomLevel) {
        throw new Error('maxZoomLevel can not be smaller than minZoomLevel');
      }
      if (value < this.zoomLevel) {
        this.zoomLevel = value;
      }
      this._nativeSet(name, value);
      this._storeProperty(name, value);
    }
  }
});

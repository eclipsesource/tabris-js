import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class ImageView extends Widget {

  get _nativeType() {
    return 'tabris.ImageView';
  }

}

NativeObject.defineProperties(ImageView.prototype, {
  image: {type: 'ImageValue', default: null},
  scaleMode: {type: ['choice', ['auto', 'fit', 'fill', 'stretch', 'none']], default: 'auto'},
  tintColor: {
    type: 'ColorValue',
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

NativeObject.defineEvents(ImageView.prototype, {
  load: {native: true},
  zoom: {native: true, changes: 'zoomLevel'}
});

import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

export default class ImageView extends Widget {

  get _nativeType() {
    return 'tabris.ImageView';
  }

  _beforePropertyChange(name, value) {
    if (name === 'zoomEnabled' && !value) {
      this.minZoomLevel = 1;
      this.maxZoomLevel = 3;
      this.zoomLevel = 1;
    } else if (name === 'minZoomLevel' && value > this.zoomLevel) {
      this.zoomLevel = value;
    } else if(name === 'maxZoomLevel' && value < this.zoomLevel) {
      this.zoomLevel = value;
    }
  }

  /**
   * @param {string[]} properties
   */
  _reorderProperties(properties) {
    if (properties.indexOf('maxZoomLevel') !== -1) {
      properties.unshift(properties.splice(properties.indexOf('maxZoomLevel'), 1)[0]);
    }
    if (properties.indexOf('minZoomLevel') !== -1) {
      properties.unshift(properties.splice(properties.indexOf('minZoomLevel'), 1)[0]);
    }
    if (properties.indexOf('zoomEnabled') !== -1) {
      properties.unshift(properties.splice(properties.indexOf('zoomEnabled'), 1)[0]);
    }
    return properties;
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['image', (this.image || {src: ''}).src],
    ]);
  }

}

NativeObject.defineProperties(ImageView.prototype, {
  image: {type: types.ImageValue, default: null},
  scaleMode: {
    type: types.string,
    choice: ['auto', 'fit', 'fill', 'stretch', 'none'],
    default: 'auto'
  },
  tintColor: {type: types.ColorValue, default: 'initial'},
  zoomEnabled: {type: types.boolean, default: false},
  zoomLevel: {
    type: {
      convert(value, imageView) {
        if (!imageView.zoomEnabled) {
          throw new Error('zoomLevel can not be set when zoomEnabled is false');
        }
        const num = types.number.convert(value);
        if (num < imageView.minZoomLevel) {
          throw new Error('zoomLevel can not be smaller than minZoomLevel');
        }
        if (num > imageView.maxZoomLevel) {
          throw new Error('zoomLevel can not be larger than maxZoomLevel');
        }
        return num;
      }
    },
    nocache: true
  },
  minZoomLevel: {
    type: {
      convert(value, imageView) {
        if (!imageView.zoomEnabled) {
          throw new Error('minZoomLevel can not be set when zoomEnabled is false');
        }
        const num = types.number.convert(value);
        if (num > imageView.maxZoomLevel) {
          throw new Error('minZoomLevel can not be larger than maxZoomLevel');
        }
        return num;
      }
    },
    default: 1.0,
  },
  maxZoomLevel: {
    type: {
      convert(value, imageView) {
        if (!imageView.zoomEnabled) {
          throw new Error('maxZoomLevel can not be set when zoomEnabled is false');
        }
        const num = types.number.convert(value);
        if (num < imageView.minZoomLevel) {
          throw new Error('maxZoomLevel can not be smaller than minZoomLevel');
        }
        return num;
      }
    },
    default: 3.0
  }
});

NativeObject.defineEvents(ImageView.prototype, {
  load: {native: true},
  zoom: {native: true, changes: 'zoomLevel'}
});

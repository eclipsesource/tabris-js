import Widget from '../Widget';

const CONFIG = {
  _name: 'ImageView',
  _type: 'tabris.ImageView',
  _events: {
    load: {
      trigger(name, event) {
        this.trigger('load', this, event);
      }
    }
  },
  _properties: {
    image: {type: 'image', default: null},
    scaleMode: {type: ['choice', ['auto', 'fit', 'fill', 'stretch', 'none']], default: 'auto'},
    tintColor: {
      type: 'color',
      access: {
        set(name, value, options) {
          this._nativeSet(name, value === undefined ? null : value);
          this._storeProperty(name, value, options);
        }
      }
    }
  }
};

export default class ImageView extends Widget.extend(CONFIG) {}

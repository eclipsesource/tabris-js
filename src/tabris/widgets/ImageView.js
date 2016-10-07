import Widget from '../Widget';

export default Widget.extend({
  _name: 'ImageView',
  _type: 'tabris.ImageView',
  _events: {
    load: {
      trigger(event) {
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
});

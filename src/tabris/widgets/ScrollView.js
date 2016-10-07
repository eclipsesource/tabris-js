import Widget from '../Widget';

export default Widget.extend({

  _name: 'ScrollView',

  _type: 'tabris.ScrollView',

  _supportsChildren: true,

  _properties: {
    direction: {
      type: ['choice', ['horizontal', 'vertical']],
      default: 'vertical'
    },
    offsetX: {type: 'number', nocache: true, access: {set() {}}},
    offsetY: {type: 'number', nocache: true, access: {set() {}}}
  },

  _events: {
    scrollX: {
      alias: 'change:offsetX',
      trigger(offset) {
        this._triggerChangeEvent('offsetX', offset);
        this.trigger('scrollX', this, offset, {});
      }
    },
    scrollY: {
      alias: 'change:offsetY',
      trigger(offset) {
        this._triggerChangeEvent('offsetY', offset);
        this.trigger('scrollY', this, offset, {});
      }
    }
  },

  scrollToY(offsetY, options) {
    this._nativeCall('scrollToY', {
      offsetY,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  },

  scrollToX(offsetX, options) {
    this._nativeCall('scrollToX', {
      offsetX,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  }

});

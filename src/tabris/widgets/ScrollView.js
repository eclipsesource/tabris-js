import Widget from '../Widget';

const CONFIG = {

  _name: 'ScrollView',

  _type: 'tabris.ScrollView',

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
      trigger({offset}) {
        this._triggerChangeEvent('offsetX', offset);
        this.trigger('scrollX', this, offset, {});
      }
    },
    scrollY: {
      alias: 'change:offsetY',
      trigger({offset}) {
        this._triggerChangeEvent('offsetY', offset);
        this.trigger('scrollY', this, offset, {});
      }
    }
  }

};

export default class ScrollView extends Widget.extend(CONFIG) {

  _acceptChild() {
    return true;
  }

  scrollToY(offset, options) {
    this._nativeCall('scrollToY', {
      offset,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  }

  scrollToX(offset, options) {
    this._nativeCall('scrollToX', {
      offset,
      animate: options && 'animate' in options ? !!options.animate : true
    });
    return this;
  }

}

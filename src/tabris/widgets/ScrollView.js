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
      trigger(name, {offset}) {
        this.trigger('scrollX', this, offset, {});
      }
    },
    scrollY: {
      trigger(name, {offset}) {
        this.trigger('scrollY', this, offset, {});
      }
    }
  }

};

export default class ScrollView extends Widget.extend(CONFIG) {

  _listen(name, listening) {
    if (name === 'change:offsetX') {
      this._onoff('scrollX', listening, this.$triggerChangeOffsetX);
    } else if (name === 'change:offsetY') {
      this._onoff('scrollY', listening, this.$triggerChangeOffsetY);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeOffsetX(widget, offset) {
    this._triggerChangeEvent('offsetX', offset);
  }

  $triggerChangeOffsetY(widget, offset) {
    this._triggerChangeEvent('offsetY', offset);
  }

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

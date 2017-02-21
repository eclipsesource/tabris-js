import NativeObject from '../NativeObject';
import Widget from '../Widget';

const EVENT_TYPES = ['scrollX', 'scrollY'];

export default class ScrollView extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.ScrollView', properties);
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'change:offsetX') {
      this._onoff('scrollX', listening, this.$triggerChangeOffsetX);
    } else if (name === 'change:offsetY') {
      this._onoff('scrollY', listening, this.$triggerChangeOffsetY);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeOffsetX({offset}) {
    this._triggerChangeEvent('offsetX', offset);
  }

  $triggerChangeOffsetY({offset}) {
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

NativeObject.defineProperties(ScrollView.prototype, {
  direction: {
    type: ['choice', ['horizontal', 'vertical']],
    default: 'vertical'
  },
  offsetX: {type: 'number', nocache: true, access: {set() {}}},
  offsetY: {type: 'number', nocache: true, access: {set() {}}}
});

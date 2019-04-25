import NativeObject from '../NativeObject';
import Composite from './Composite';

const EVENT_TYPES = ['scrollX', 'scrollY', 'scrollXStateChanged', 'scrollYStateChanged'];

export default class ScrollView extends Composite {

  get _nativeType() {
    return 'tabris.ScrollView';
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else if (name === 'offsetXChanged') {
      this._onoff('scrollX', listening, this.$triggerChangeOffsetX);
    } else if (name === 'offsetYChanged') {
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
  offsetX: {type: 'number', nocache: true, readonly: true},
  offsetY: {type: 'number', nocache: true, readonly: true},
  scrollXState: {type: 'string', nocache: true, readonly: true},
  scrollYState: {type: 'string', nocache: true, readonly: true}
});

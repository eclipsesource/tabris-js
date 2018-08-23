import NativeObject from '../NativeObject';
import Composite from './Composite';

export default class ScrollView extends Composite {

  get _nativeType() {
    return 'tabris.ScrollView';
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
    default: 'vertical',
    const: true
  },
  offsetX: {type: 'number', nocache: true, readonly: true},
  offsetY: {type: 'number', nocache: true, readonly: true},
  scrollbarVisible: {type: 'boolean', default: true}
});

NativeObject.defineEvents(ScrollView.prototype, {
  scrollX: {native: true, changes: 'offsetX', changeValue: 'offset'},
  scrollY: {native: true, changes: 'offsetY', changeValue: 'offset'}
});

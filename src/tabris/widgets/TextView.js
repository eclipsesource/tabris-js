import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class TextView extends Widget {

  get _nativeType() {
    return 'tabris.TextView';
  }

}

NativeObject.defineProperties(TextView.prototype, {
  alignment: {type: ['choice', ['left', 'right', 'center']], default: 'left'},
  markupEnabled: {type: 'boolean', default: false}, // TODO: readonly
  lineSpacing: {type: 'number', default: 1},
  selectable: {type: 'boolean', default: false},
  maxLines: {
    type: ['nullable', 'natural'],
    default: null,
    set(name, value) {
      this._nativeSet(name, value <= 0 ? null : value);
      this._storeProperty(name, value);
    }
  },
  text: {type: 'string', default: ''}
});

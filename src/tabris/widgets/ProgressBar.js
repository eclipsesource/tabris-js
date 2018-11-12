import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class ProgressBar extends Widget {

  get _nativeType() {
    return 'tabris.ProgressBar';
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['selection', this.selection],
      ['minimum', this.minimum],
      ['maximum', this.maximum]
    ]);
  }

}

NativeObject.defineProperties(ProgressBar.prototype, {
  minimum: {type: 'integer', default: 0},
  maximum: {type: 'integer', default: 100},
  tintColor: {type: 'ColorValue'},
  selection: {type: 'integer', default: 0},
  state: {type: ['choice', ['normal', 'paused', 'error']], default: 'normal'}
});

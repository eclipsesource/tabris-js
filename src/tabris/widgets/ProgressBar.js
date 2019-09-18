import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

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
  minimum: {type: types.integer, default: 0},
  maximum: {type: types.integer, default: 100},
  tintColor: {type: types.ColorValue, default: null},
  selection: {type: types.integer, default: 0},
  state: {
    type: types.string,
    choice: ['normal', 'paused', 'error'],
    default: 'normal'
  }
});

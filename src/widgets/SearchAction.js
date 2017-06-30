import NativeObject from '../NativeObject';
import Widget from '../Widget';

const EVENT_TYPES = ['input', 'accept', 'select'];

export default class SearchAction extends Widget {

  get _nativeType() {
    return 'tabris.SearchAction';
  }

  _listen(name, listening) {
    if (EVENT_TYPES.includes(name)) {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

  open() {
    this._nativeCall('open', {});
    return this;
  }

}

NativeObject.defineProperties(SearchAction.prototype, {
  image: {type: 'image', default: null},
  placementPriority: {type: ['choice', ['low', 'high', 'normal']], default: 'normal'},
  title: {type: 'string', default: ''},
  proposals: {default() {return [];}},
  text: {type: 'string', nocache: true},
  message: {type: 'string', default: ''},
  win_symbol: {type: 'string', default: ''}
});

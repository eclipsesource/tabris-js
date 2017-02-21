import NativeObject from '../NativeObject';
import Widget from '../Widget';

export default class Action extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Action', properties);
  }

  _listen(name, listening) {
    if (name === 'select') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(Action.prototype, {
  image: {type: 'image', default: null},
  placementPriority: {
    type: ['choice', ['low', 'high', 'normal']],
    access: {
      set(name, value, options) {
        this._nativeSet(name, value.toUpperCase());
        this._storeProperty(name, value, options);
      }
    },
    default: 'normal'
  },
  title: {type: 'string', default: ''},
  win_symbol: {type: 'string', default: ''}
});

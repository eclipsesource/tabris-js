import Composite from './Composite';
import NativeObject from '../NativeObject';

export default class RefreshComposite extends Composite {

  get _nativeType() {
    return 'tabris.RefreshComposite';
  }

  _listen(name, listening) {
    if (name === 'refresh') {
      this._nativeListen(name, listening);
    } else {
      super._listen(name, listening);
    }
  }

}

NativeObject.defineProperties(RefreshComposite.prototype, {

  refreshEnabled: {
    type: 'boolean',
    default: true
  },
  refreshIndicator: {
    type: 'boolean',
    nocache: true
  },
  refreshMessage: {
    type: 'string',
    default: ''
  }

});

NativeObject.defineEvents(RefreshComposite.prototype, {
  refresh: {native: true}
});

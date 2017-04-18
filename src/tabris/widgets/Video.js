import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

export default class Video extends Widget {

  get _nativeType() {
    return 'tabris.Video';
  }

  _listen(name, listening) {
    if (name === 'stateChanged') {
      this._nativeListen('statechange', listening) ;
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'statechange') {
      return this._triggerChangeEvent('state', event.state);
    }
    return super._trigger(name, event);
  }

  pause() {
    this._nativeCall('pause');
  }

  play(speed) {
    this._nativeCall('play', {
      speed: arguments.length > 0 ? types.number.encode(speed) : 1
    });
  }

  seek(position) {
    this._nativeCall('seek', {position: types.number.encode(position)});
  }

}

NativeObject.defineProperties(Video.prototype, {
  url: {type: 'string', default: ''},
  controlsVisible: {type: 'boolean', default: true},
  autoPlay: {type: 'boolean', default: true},
  speed: {readonly: true},
  position: {readonly: true},
  duration: {readonly: true},
  state: {readonly: true}
});

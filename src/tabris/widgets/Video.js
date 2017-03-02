import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

export default class Video extends Widget {

  get _nativeType() {
    return 'tabris.Video';
  }

  _listen(name, listening) {
    if (name === 'change:state') {
      this._nativeListen('statechange', listening) ;
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'statechange') {
      this._triggerChangeEvent('state', event.state);
    } else {
      super._trigger(name, event);
    }
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

function readOnlySet(name) {
  console.warn('Can not set read-only property "' + name + '"');
}

NativeObject.defineProperties(Video.prototype, {
  url: {type: 'string', default: ''},
  controlsVisible: {type: 'boolean', default: true},
  autoPlay: {type: 'boolean', default: true},
  speed: {set: readOnlySet},
  position: {set: readOnlySet},
  duration: {set: readOnlySet},
  state: {set: readOnlySet}
});

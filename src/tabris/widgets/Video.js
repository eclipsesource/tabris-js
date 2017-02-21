import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

export default class Video extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Video', properties);
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

const readOnly = {
  set(name) {
    console.warn('Can not set read-only property "' + name + '"');
  }
};

NativeObject.defineProperties(Video.prototype, {
  url: {type: 'string', default: ''},
  controlsVisible: {type: 'boolean', default: true},
  autoPlay: {type: 'boolean', default: true},
  speed: {access: readOnly},
  position: {access: readOnly},
  duration: {access: readOnly},
  state: {access: readOnly}
});

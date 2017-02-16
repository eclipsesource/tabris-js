import Widget from '../Widget';
import {types} from '../property-types';

const readOnly = {
  set(name) {
    console.warn('Can not set read-only property "' + name + '"');
  }
};

const CONFIG = {
  _name: 'Video',
  _type: 'tabris.Video',
  _properties: {
    url: {type: 'string', default: ''},
    controlsVisible: {type: 'boolean', default: true},
    autoPlay: {type: 'boolean', default: true},
    speed: {access: readOnly},
    position: {access: readOnly},
    duration: {access: readOnly},
    state: {access: readOnly}
  },
  _events: {
    'change:state': 'statechange'
  }
};

export default class Video extends Widget.extend(CONFIG) {

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

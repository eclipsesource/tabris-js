import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';

export default class Video extends Widget {

  get _nativeType() {
    return 'tabris.Video';
  }

  _listen(name, listening) {
    if (name === 'stateChanged' || name === 'speedChanged') {
      this._nativeListen(name, listening) ;
    } else {
      super._listen(name, listening);
    }
  }

  _trigger(name, event) {
    if (name === 'stateChanged') {
      return this._triggerChangeEvent('state', event.state);
    } else if (name === 'speedChanged') {
      return this._triggerChangeEvent('speed', event.speed);
    }
    return super._trigger(name, event);
  }

  pause() {
    this._nativeCall('pause');
  }

  play(speed) {
    this._nativeCall('play', {
      speed: arguments.length > 0 ? types.number.convert(speed) : 1
    });
  }

  seek(position) {
    this._nativeCall('seek', {position: types.number.convert(position)});
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    if (this.url) {
      result.push(['url', this.url]);
    }
    result.push(['state', this.state]);
    if (this.state === 'play') {
      result.push(['speed', this.speed]);
    }
    if (this.state !== 'empty') {
      result.push(['position', this.position]);
    }
    if (this.duration) {
      result.push(['duration', this.duration]);
    }
    return result;
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

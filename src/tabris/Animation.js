import NativeObject from './NativeObject';
import {hint} from './Console';

const ANIMATABLE_PROPERTIES = ['opacity', 'transform'];

const PROPERTIES = {
  properties: {type: 'any'},
  delay: {type: 'natural'},
  duration: {type: 'natural'},
  repeat: {type: 'natural'},
  reverse: {type: 'boolean'},
  easing: {type: ['choice', ['linear', 'ease-in', 'ease-out', 'ease-in-out']]},
  target: {type: 'NativeObject'}
};

class Animation extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.Animation', properties);
    this._nativeListen('completed', true);
  }

  _trigger(name, event) {
    if (name === 'completed') {
      this.target.off('dispose', this.abort, this);
      if (this._resolve) {
        this._resolve();
      }
      this.dispose();
    } else {
      super._trigger(name, event);
    }
  }

  start(resolve, reject) {
    this.target.on('dispose', this.abort, this);
    this._resolve = resolve;
    this._reject = reject;
    this._nativeCall('start');
  }

  abort() {
    if (this._reject) {
      this._reject();
    }
    this.dispose();
  }

}

NativeObject.defineProperties(Animation.prototype, PROPERTIES);

export function animate(properties, options) {
  const animatedProps = {};
  for (const property in properties) {
    if (ANIMATABLE_PROPERTIES.includes(property)) {
      try {
        animatedProps[property] =
          this._encodeProperty(this._getTypeDef(property), properties[property]);
        this._storeProperty(property, animatedProps[property], options);
      } catch (ex) {
        hint(this, 'Ignored invalid animation property value for "' + property + '"');
      }
    } else {
      hint(this, 'Ignored invalid animation property "' + property + '"');
    }
  }
  for (const option in options) {
    if (!(option in PROPERTIES) && option !== 'name') {
      hint(this, 'Ignored invalid animation option "' + option + '"');
    }
  }
  return new Promise((resolve, reject) => {
    new Animation(Object.assign({}, options, {
      target: this,
      properties: animatedProps
    })).start(resolve, reject);
  });
}

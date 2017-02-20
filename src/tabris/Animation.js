import NativeObject from './NativeObject';

const PROPERTIES = {
  properties: 'any',
  delay: 'natural',
  duration: 'natural',
  repeat: 'natural',
  reverse: 'boolean',
  easing: ['choice', ['linear', 'ease-in', 'ease-out', 'ease-in-out']],
  target: 'proxy'
};

class Animation extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.Animation', properties);
    this._nativeListen('Start', true);
    this._nativeListen('Completion', true);
  }

  _trigger(name, event) {
    if (name === 'Start') {
      this._target.trigger('animationstart', Object.assign({target: this._target}, this._options));
    } else if (name === 'Completion') {
      this._target.off('dispose', this.abort, this);
      this._target.trigger('animationend', Object.assign({target: this._target}, this._options));
      if (this._resolve) {
        this._resolve();
      }
      this.dispose();
    } else {
      super._trigger(name, event);
    }
  }

  start() {
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
  let animatedProps = {};
  for (let property in properties) {
    if (animatable[property]) {
      try {
        animatedProps[property] =
          this._encodeProperty(this._getTypeDef(property), properties[property]);
        this._storeProperty(property, animatedProps[property], options);
      } catch (ex) {
        console.warn(this + ': Ignored invalid animation property value for "' + property + '"');
      }
    } else {
      console.warn(this + ': Ignored invalid animation property "' + property + '"');
    }
  }
  for (let option in options) {
    if (!(option in PROPERTIES) && option !== 'name') {
      console.warn(this + ': Ignored invalid animation option "' + option + '"');
    }
  }
  let animation = new Animation(Object.assign({}, options, {
    target: this,
    properties: animatedProps
  }));
  animation._target = this;
  animation._options = options;
  this.on('dispose', animation.abort, animation);
  animation.start();
  return new Promise((resolve, reject) => {
    animation._resolve = resolve;
    animation._reject = reject;
  });
}

let animatable = {
  opacity: true,
  transform: true
};

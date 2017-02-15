import NativeObject from './NativeObject';

const CONFIG = {

  _name: '_Animation',

  _type: 'tabris.Animation',

  _events: {
    Start: {
      trigger() {
        this._target.trigger('animationstart', Object.assign({target: this._target}, this._options));
      }
    },
    Completion: {
      trigger() {
        this._target.off('dispose', this.abort, this);
        this._target.trigger('animationend', Object.assign({target: this._target}, this._options));
        if (this._resolve) {
          this._resolve();
        }
        this.dispose();
      }
    }
  },

  _properties: {
    properties: 'any',
    delay: 'natural',
    duration: 'natural',
    repeat: 'natural',
    reverse: 'boolean',
    easing: ['choice', ['linear', 'ease-in', 'ease-out', 'ease-in-out']],
    target: 'proxy'
  }

};

class Animation extends NativeObject.extend(CONFIG) {

  _create(type, properties) {
    super._create(type, properties);
    this._nativeListen('Start', true);
    this._nativeListen('Completion', true);
    return this;
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
    if (!Animation.prototype.$properties[option] && option !== 'name') {
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

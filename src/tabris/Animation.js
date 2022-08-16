import NativeObject from './NativeObject';
import {hint, toValueString} from './Console';
import {types} from './property-types';

const ANIMATABLE_PROPERTIES = ['opacity', 'transform'];

/** @type {PropertyDefinitions} */
const PROPERTIES = {
  properties: {default: Object.freeze({})},
  delay: {type: types.natural, default: 0},
  duration: {type: types.natural, default: null},
  repeat: {
    type: {
      convert(value) {
        if (typeof value !== 'number') {
          throw new Error(`${toValueString(value)} is not a number`);
        }
        if (!(isFinite(value) || isNaN(value) || value === Infinity)) {
          throw new Error(`${toValueString(value)} is not a valid number`);
        }
        return value;
      },
      encode(value) {
        return value === Infinity ? -1 : value;
      }
    },
    default: 1
  },
  reverse: {type: types.boolean, default: false},
  easing: {
    type: types.string,
    choice: ['linear', 'ease-in', 'ease-out', 'ease-in-out'],
    default: 'liniear'
  },
  target: {type: types.Widget, default: null}
};

class Animation extends NativeObject {

  constructor(properties) {
    super(properties);
    this._nativeListen('completed', true);
    this._nativeListen('rejected', true);
  }

  get _nativeType() {
    return 'tabris.Animation';
  }

  _trigger(name, event) {
    if (name === 'completed') {
      this.target.off('_dispose', this.abort, this);
      if (this._resolve) {
        this._resolve();
      }
      this.dispose();
    } else if (name === 'rejected') {
      this.target.off('_dispose', this.abort, this);
      this.abort();
    } else {
      super._trigger(name, event);
    }
  }

  start(resolve, reject) {
    if (this.target.isDisposed()) {
      this.abort();
      return;
    }
    this.target.on('_dispose', this.abort, this);
    Object.defineProperties(this, {
      _resolve: {enumerable: false, writable: false, value: resolve},
      _reject: {enumerable: false, writable: false, value: reject}
    });
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

/**
 * @this {import('./Widget').default}
 * @param {{opacity?: number, transform?: Transformation}} properties
 * @param {AnimationOptions} options
 * @returns {Promise}
 */
export function animate(properties, options) {
  const animatedProps = {};
  for (const property in properties) {
    if (ANIMATABLE_PROPERTIES.indexOf(property) !== -1) {
      try {
        const def = this._getPropertyDefinition(property);
        animatedProps[property] = this._convertValue(def, properties[property]);
        this._storeProperty(property, animatedProps[property]);
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

import {colorArrayToString} from './util-colors';
import {getNativeObject} from './util';
import Color from './Color';
import {fontStringToObject, fontObjectToString} from './util-fonts';
import ImageData from './ImageData';
import GC from './GC';
import {hint, toValueString} from './Console';
import ImageBitmap from './ImageBitmap';

export default class CanvasContext {

  /**
   * @param {GC} gc
   */
  constructor(gc) {
    Object.defineProperties(this, {
      _gc: {enumerable: false, writable: false, value: gc},
      _state: {enumerable: false, writable: true, value: createState()},
      _savedStates: {enumerable: false, writable: false, value: []}
    });
    this.canvas = {
      width: 0,
      height: 0,
      style: {}
    };
    for (const name in properties) {
      defineProperty(this, name);
    }
  }

  measureText(text) {
    // TODO: delegate to native function, once it is implemented (#56)
    return {width: text.length * 5 + 5};
  }

  // ImageData operations

  getImageData(x, y, width, height) {
    checkRequiredArgs(arguments, 4, 'CanvasContext.getImageData');
    this._gc.flush();
    // TODO check validity of args
    const array = this._gc.getImageData(x, y, width, height);
    return new ImageData(array, width, height);
  }

  putImageData(imageData, x, y) {
    checkRequiredArgs(arguments, 3, 'CanvasContext.putImageData');
    this._gc.flush();
    this._gc.putImageData(imageData, x, y);
  }

  createImageData(width, height) {
    if (arguments[0] instanceof ImageData) {
      const data = arguments[0];
      width = data.width;
      height = data.height;
    } else {
      checkRequiredArgs(arguments, 2, 'CanvasContext.createImageData');
    }
    return new ImageData(width, height);
  }

  _init(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this._gc.init({width, height});
  }

}

/** @typedef {{[Key in keyof typeof properties]: any}} State */

Object.defineProperty(CanvasContext.prototype, '_gc', {
  enumerable: false, value: (/** @type {GC} */(null))
});

Object.defineProperty(CanvasContext.prototype, '_state', {
  enumerable: false, writable: true, value: (/** @type {State} */(null))
});

Object.defineProperty(CanvasContext.prototype, '_savedStates', {
  enumerable: false, writable: false, value: (/** @type {State[]} */(null))
});

// State operations

defineMethod('save', 0, /** @this {CanvasContext} */ function() {
  this._savedStates.push(Object.assign({}, this._state));
});

defineMethod('restore', 0, /** @this {CanvasContext} */ function() {
  this._state = this._savedStates.pop() || this._state;
});

// Path operations

defineMethod('beginPath');

defineMethod('closePath');

defineMethod('lineTo', 2, /** @this {CanvasContext} */ function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('moveTo', 2, /** @this {CanvasContext} */ function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('bezierCurveTo', 6, /** @this {CanvasContext} */ function(cp1x, cp1y, cp2x, cp2y, x, y) {
  this._gc.addDouble(cp1x, cp1y, cp2x, cp2y, x, y);
});

defineMethod('quadraticCurveTo', 4, /** @this {CanvasContext} */ function(cpx, cpy, x, y) {
  this._gc.addDouble(cpx, cpy, x, y);
});

defineMethod('rect', 4, /** @this {CanvasContext} */ function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('arc', 5, /** @this {CanvasContext} */ function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this._gc.addDouble(x, y, radius, startAngle, endAngle);
  this._gc.addBoolean(!!anticlockwise);
});

defineMethod('arcTo', 5, /** @this {CanvasContext} */ function(x1, y1, x2, y2, radius) {
  this._gc.addDouble(x1, y1, x2, y2, radius);
});

// Transformations

defineMethod('scale', 2, /** @this {CanvasContext} */ function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('rotate', 1, /** @this {CanvasContext} */ function(angle) {
  this._gc.addDouble(angle);
});

defineMethod('translate', 2, /** @this {CanvasContext} */ function(x, y) {
  this._gc.addDouble(x, y);
});

defineMethod('transform', 6, /** @this {CanvasContext} */ function(a, b, c, d, e, f) {
  this._gc.addDouble(a, b, c, d, e, f);
});

defineMethod('setTransform', 6, /** @this {CanvasContext} */ function(a, b, c, d, e, f) {
  this._gc.addDouble(a, b, c, d, e, f);
});

// Drawing operations

defineMethod('clearRect', 4, /** @this {CanvasContext} */ function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('fillRect', 4, /** @this {CanvasContext} */ function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('strokeRect', 4, /** @this {CanvasContext} */ function(x, y, width, height) {
  this._gc.addDouble(x, y, width, height);
});

defineMethod('fillText', 3, /** @this {CanvasContext} */ function(text, x, y /* , maxWidth */) {
  this._gc.addString(text);
  this._gc.addBoolean(false, false, false);
  this._gc.addDouble(x, y);
});

defineMethod('strokeText', 3, /** @this {CanvasContext} */ function(text, x, y /* , maxWidth */) {
  this._gc.addString(text);
  this._gc.addBoolean(false, false, false);
  this._gc.addDouble(x, y);
});

defineMethod('fill');

defineMethod('stroke');

defineMethod('drawImage', 3, /** @this {CanvasContext} */ function(image, x1, y1, w1, h1, x2, y2, w2, h2) {
  if (!(image instanceof ImageBitmap)) {
    throw new TypeError('First argument of CanvasContext.drawImage must be of type ImageBitmap');
  }
  this._gc.addString(getNativeObject(image).cid);
  if (arguments.length === 9) {
    this._gc.addDouble(x1, y1, w1, h1, x2, y2, w2, h2);
  } else if (arguments.length === 5) {
    this._gc.addDouble(0, 0, image.width, image.height, x1, y1, w1, h1);
  } else if (arguments.length === 3) {
    this._gc.addDouble(0, 0, image.width, image.height, x1, y1, image.width, image.height);
  } else {
    throw new TypeError(arguments.length + ' is not a valid argument count for any overload of Canvas.drawImage.');
  }
});

CanvasContext.getContext = function(canvas, width, height) {
  if (!canvas._gc) {
    Object.defineProperty(canvas, '_gc', {
      enumerable: false,
      writable: false,
      value: new GC({parent: canvas})
    });
  }
  if (!canvas._ctx) {
    Object.defineProperty(canvas, '_ctx', {
      enumerable: false,
      writable: false,
      value: new CanvasContext(canvas._gc)
    });
  }
  canvas._ctx._init(width, height);
  return canvas._ctx;
};

const properties = {
  lineWidth: {
    init: 1,
    encode(value) {
      if (!isNaN(value) && value > 0) {
        return value;
      }
      throw new Error(`Invalid value ${toValueString(value)}`);
    },
    decode: passThrough,
    addOperations(value) {
      this._gc.addDouble(value);
    }
  },
  lineCap: {
    init: 'butt',
    values: toObject(['butt', 'round', 'square']),
    encode: checkValue,
    decode: passThrough,
    addOperations(value) {
      this._gc.addString(value);
    }
  },
  lineJoin: {
    init: 'miter',
    values: toObject(['bevel', 'miter', 'round']),
    encode: checkValue,
    decode: passThrough,
    addOperations(value) {
      this._gc.addString(value);
    }
  },
  fillStyle: {
    init: [0, 0, 0, 255],
    encode: value => Color.from(value).toArray(),
    decode: colorArrayToString,
    addOperations(value) {
      this._gc.addInt(value[0], value[1], value[2], value[3]);
    }
  },
  strokeStyle: {
    init: [0, 0, 0, 255],
    encode: value => Color.from(value).toArray(),
    decode: colorArrayToString,
    addOperations(value) {
      this._gc.addInt(value[0], value[1], value[2], value[3]);
    }
  },
  textAlign: {
    init: 'start',
    values: toObject(['start', 'end', 'left', 'right', 'center']),
    encode: checkValue,
    decode: passThrough,
    addOperations(value) {
      this._gc.addString(value);
    }
  },
  textBaseline: {
    init: 'alphabetic',
    values: toObject(['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']),
    encode: checkValue,
    decode: passThrough,
    addOperations(value) {
      this._gc.addString(value);
    }
  },
  font: {
    init: {family: ['sans-serif'], size: 12, weight: 'normal', style: 'normal'},
    encode: fontStringToObject,
    decode: fontObjectToString,
    addOperations(font) {
      this._gc.addString(font.family.join(', '), font.style, font.weight);
      this._gc.addDouble(font.size);
    }
  }
};

function passThrough(value) {
  return value;
}

/** @this {{values: any[]}} */
function checkValue(value) {
  if (value in this.values) {
    return value;
  }
  throw new Error(`Invalid value ${toValueString(value)}`);
}

function toObject(array) {
  const obj = {};
  array.forEach((name) => {
    obj[name] = true;
  });
  return obj;
}

function createState() {
  const state = {};
  for (const name in properties) {
    state[name] = properties[name].init;
  }
  return state;
}

/**
 * @param {string} name
 * @param {number=} reqArgCount
 * @param {((this: CanvasContext, ...args: any[]) => any)=} fn
 */
function defineMethod(name, reqArgCount, fn) {
  CanvasContext.prototype[name] = /** @this {CanvasContext} */ function() {
    checkRequiredArgs(arguments, reqArgCount, 'CanvasContext.' + name);
    this._gc.addOperation(name);
    if (fn) {
      fn.apply(this, arguments);
    }
  };
}

function defineProperty(context, name) {
  const prop = properties[name];
  Object.defineProperty(context, name, {
    get() {
      return prop.decode(context._state[name]);
    },
    set(value) {
      try {
        context._state[name] = prop.encode(value);
        context._gc.addOperation(name);
        prop.addOperations.call(context, context._state[name]);
      } catch (error) {
        hint(context, 'Unsupported value for ' + name + ': ' + value);
      }
    }
  });
}

function checkRequiredArgs(args, nr, name) {
  if (args.length < nr) {
    throw new Error('Not enough arguments to ' + name);
  }
}

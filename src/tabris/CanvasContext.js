import {colorStringToArray, colorArrayToString} from './util-colors';
import ImageData from './ImageData';
import GC from './GC';
import LegacyCanvasContext from './LegacyCanvasContext';

export default class CanvasContext {

  constructor(gc) {
    this._gc = gc;
    this._state = createState();
    this._savedStates = [];
    this._opCodes = [];
    this._newOpCodes = [];
    this._operations = [];
    this._doubles = [];
    this._booleans = [];
    this._strings = [];
    this._ints = [];
    this.canvas = {
      width: 0,
      height: 0,
      style: {}
    };
    for (let name in properties) {
      defineProperty(this, name);
    }
    tabris.on('flush', this._flush, this);
    gc.on('dispose', function() {
      tabris.off('flush', this._flush, this);
    }, this);
  }

  fillRect(x, y, width, height) {
    // TODO: delegate to native function, once it is implemented (#493)
    if (arguments.length < 4) {
      throw new Error('Not enough arguments to CanvasContext.fillRect');
    }
    this._pushOperation('beginPath');
    this._pushOperation('rect');
    this._doubles.push(x, y, width, height);
    this.fill();
  }

  strokeRect(x, y, width, height) {
    // TODO: delegate to native function, once it is implemented (#493)
    if (arguments.length < 4) {
      throw new Error('Not enough arguments to CanvasContext.strokeRect');
    }
    this._pushOperation('beginPath');
    this._pushOperation('rect');
    this._doubles.push(x, y, width, height);
    this.stroke();
  }

  measureText(text) {
    // TODO: delegate to native function, once it is implemented (#56)
    return {width: text.length * 5 + 5};
  }

  // ImageData operations

  getImageData(x, y, width, height) {
    if (arguments.length < 4) {
      throw new Error('Not enough arguments to CanvasContext.getImageData');
    }
    this._flush();
    // TODO check validity of args
    let uint8ClampedArray = this._gc._nativeCall('getImageData', {
      x,
      y,
      width,
      height
    });
    return new ImageData(uint8ClampedArray, width, height);
  }

  putImageData(imageData, x, y) {
    if (arguments.length < 3) {
      throw new Error('Not enough arguments to CanvasContext.putImageData');
    }
    this._flush();
    this._gc._nativeCall('putImageData', {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
      x,
      y
    });
  }

  createImageData(width, height) {
    if (arguments[0] instanceof ImageData) {
      let data = arguments[0];
      width = data.width;
      height = data.height;
    } else if (arguments.length < 2) {
      throw new Error('Not enough arguments to CanvasContext.createImageData');
    }
    return new ImageData(width, height);
  }

  _init(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this._gc._nativeCall('init', {
      width,
      height,
      font: [['sans-serif'], 12, false, false],
      fillStyle: [0, 0, 0, 255],
      strokeStyle: [0, 0, 0, 255]
    });
  }

  _flush() {
    if (this._operations.length > 0) {
      this._gc._nativeCall('draw', {packedOperations: [
        this._newOpCodes,
        this._operations,
        this._doubles,
        this._booleans,
        this._strings,
        this._ints
      ]});
      this._newOpCodes = [];
      this._operations = [];
      this._doubles = [];
      this._booleans = [];
      this._strings = [];
      this._ints = [];
    }
  }

  _pushOperation(operation) {
    if (this._opCodes.indexOf(operation) < 0) {
      this._newOpCodes.push(operation);
      this._opCodes.push(operation);
    }
    this._operations.push(this._opCodes.indexOf(operation));
  }

}

// State operations

defineMethod('save', 0, function() {
  this._savedStates.push(Object.assign({}, this._state));
});

defineMethod('restore', 0, function() {
  this._state = this._savedStates.pop() || this._state;
});

// Path operations

defineMethod('beginPath');

defineMethod('closePath');

defineMethod('lineTo', 2, function(x, y) {
  this._doubles.push(x, y);
});

defineMethod('moveTo', 2, function(x, y) {
  this._doubles.push(x, y);
});

defineMethod('bezierCurveTo', 6, function(cp1x, cp1y, cp2x, cp2y, x, y) {
  this._doubles.push(cp1x, cp1y, cp2x, cp2y, x, y);
});

defineMethod('quadraticCurveTo', 4, function(cpx, cpy, x, y) {
  this._doubles.push(cpx, cpy, x, y);
});

defineMethod('rect', 4, function(x, y, width, height) {
  this._doubles.push(x, y, width, height);
});

defineMethod('arc', 5, function(x, y, radius, startAngle, endAngle, anticlockwise) {
  this._doubles.push(x, y, radius, startAngle, endAngle);
  this._booleans.push(!!anticlockwise);
});

// Transformations

defineMethod('scale', 2, function(x, y) {
  this._doubles.push(x, y);
});

defineMethod('rotate', 1, function(angle) {
  this._doubles.push(angle);
});

defineMethod('translate', 2, function(x, y) {
  this._doubles.push(x, y);
});

defineMethod('transform', 6, function(a, b, c, d, e, f) {
  this._doubles.push(a, b, c, d, e, f);
});

defineMethod('setTransform', 6, function(a, b, c, d, e, f) {
  this._doubles.push(a, b, c, d, e, f);
});

// Drawing operations

defineMethod('clearRect', 4, function(x, y, width, height) {
  this._doubles.push(x, y, width, height);
});

defineMethod('fillText', 3, function(text, x, y /* , maxWidth */) {
  this._strings.push(text);
  this._booleans.push(false, false, false);
  this._doubles.push(x, y);
});

defineMethod('strokeText', 3, function(text, x, y /* , maxWidth */) {
  this._strings.push(text);
  this._booleans.push(false, false, false);
  this._doubles.push(x, y);
});

defineMethod('fill');

defineMethod('stroke');

CanvasContext.getContext = function(canvas, width, height) {
  if (!canvas._gc) {
    canvas._gc = new GC({parent: canvas});
  }
  if (!canvas._ctx) {
    canvas._ctx = tabris.device.platform === 'iOS' ? new LegacyCanvasContext(canvas._gc)
                                                   : new CanvasContext(canvas._gc);
  }
  canvas._ctx._init(width, height);
  return canvas._ctx;
};

let properties = {
  lineWidth: {
    init: 1,
    encode(value) {
      if (value > 0) {
        return value;
      }
      throw new Error(value);
    },
    decode: passThrough,
    addOperations(context, value) {
      context._doubles.push(value);
    }
  },
  lineCap: {
    init: 'butt',
    values: toObject(['butt', 'round', 'square']),
    encode: checkValue,
    decode: passThrough,
    addOperations(context, value) {
      context._strings.push(value);
    }
  },
  lineJoin: {
    init: 'miter',
    values: toObject(['bevel', 'miter', 'round']),
    encode: checkValue,
    decode: passThrough,
    addOperations(context, value) {
      context._strings.push(value);
    }
  },
  fillStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString,
    addOperations(context, value) {
      context._ints.push(value[0], value[1], value[2], value[3]);
    }
  },
  strokeStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString,
    addOperations(context, value) {
      context._ints.push(value[0], value[1], value[2], value[3]);
    }
  },
  textAlign: {
    init: 'start',
    values: toObject(['start', 'end', 'left', 'right', 'center']),
    encode: checkValue,
    decode: passThrough,
    addOperations(context, value) {
      context._strings.push(value);
    }
  },
  textBaseline: {
    init: 'alphabetic',
    values: toObject(['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']),
    encode: checkValue,
    decode: passThrough,
    addOperations(context, value) {
      context._strings.push(value);
    }
  }
};

function passThrough(value) {
  return value;
}

function checkValue(value) {
  if (value in this.values) {
    return value;
  }
  throw new Error(value);
}

function toObject(array) {
  let obj = {};
  array.forEach((name) => {
    obj[name] = true;
  });
  return obj;
}

function createState() {
  let state = {};
  for (let name in properties) {
    state[name] = properties[name].init;
  }
  return state;
}

function defineMethod(name, reqArgCount, fn) {
  CanvasContext.prototype[name] = function() {
    if (reqArgCount && arguments.length < reqArgCount) {
      throw new Error('Not enough arguments to CanvasContext.' + name);
    }
    this._pushOperation(name);
    if (fn) {
      fn.apply(this, arguments);
    }
  };
}

function defineProperty(context, name) {
  let prop = properties[name];
  Object.defineProperty(context, name, {
    get() {
      return prop.decode(context._state[name]);
    },
    set(value) {
      try {
        context._state[name] = prop.encode(value);
        context._pushOperation(name);
        prop.addOperations(context, context._state[name]);
      } catch (error) {
        console.warn('Unsupported value for ' + name + ': ' + value);
      }
    }
  });
}

import {colorStringToArray, colorArrayToString} from './util-colors';
import {clone} from './util';
import ImageData from './ImageData';

export default function LegacyCanvasContext(gc) {
  this._gc = gc;
  this._state = createState();
  this._savedStates = [];
  this._operations = [];
  this.canvas = {
    width: 0,
    height: 0,
    style: {}
  };
  for (var name in properties) {
    defineProperty(this, name);
  }
  tabris.on('flush', this._flush, this);
  gc.on('dispose', function() {
    tabris.off('flush', this._flush, this);
  }, this);
}

LegacyCanvasContext.prototype = {

  save: function() {
    this._operations.push(['save']);
    this._savedStates.push(clone(this._state));
  },

  restore: function() {
    this._operations.push(['restore']);
    this._state = this._savedStates.pop() || this._state;
  },

  // Path operations

  beginPath: function() {
    this._operations.push(['beginPath']);
  },

  closePath: function() {
    this._operations.push(['closePath']);
  },

  lineTo: function(x, y) {
    this._operations.push(['lineTo', x, y]);
  },

  moveTo: function(x, y) {
    this._operations.push(['moveTo', x, y]);
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    this._operations.push(['bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y]);
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    this._operations.push(['quadraticCurveTo', cpx, cpy, x, y]);
  },

  rect: function(x, y, width, height) {
    this._operations.push(['rect', x, y, width, height]);
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    this._operations.push(['arc', x, y, radius, startAngle, endAngle, !!anticlockwise]);
  },

  // Transformations

  scale: function(x, y) {
    this._operations.push(['scale', x, y]);
  },

  rotate: function(angle) {
    this._operations.push(['rotate', angle]);
  },

  translate: function(x, y) {
    this._operations.push(['translate', x, y]);
  },

  transform: function(a, b, c, d, e, f) {
    this._operations.push(['transform', a, b, c, d, e, f]);
  },

  setTransform: function(a, b, c, d, e, f) {
    this._operations.push(['setTransform', a, b, c, d, e, f]);
  },

  // Drawing operations

  clearRect: function(x, y, width, height) {
    this._operations.push(['clearRect', x, y, width, height]);
  },

  fillRect: function(x, y, width, height) {
    this._operations.push(['beginPath'], ['rect', x, y, width, height]);
    this.fill();
  },

  strokeRect: function(x, y, width, height) {
    this._operations.push(['beginPath'], ['rect', x, y, width, height]);
    this.stroke();
  },

  fillText: function(text, x, y /*, maxWidth*/) {
    this._operations.push(['fillText', text, false, false, false, x, y]);
  },

  strokeText: function(text, x, y /*, maxWidth*/) {
    this._operations.push(['strokeText', text, false, false, false, x, y]);
  },

  fill: function() {
    this._operations.push(['fill']);
  },

  stroke: function() {
    this._operations.push(['stroke']);
  },

  measureText: function(text) {
    // TODO wire to native function
    return {width: text.length * 5 + 5};
  },

  // ImageData operations

  getImageData: function(x, y, width, height) {
    if (arguments.length < 4) {
      throw new Error('Not enough arguments to CanvasContext.getImageData');
    }
    this._flush();
    // TODO check validity of args
    var array = this._gc._nativeCall('getImageData', {
      x: x,
      y: y,
      width: width,
      height: height
    });
    return new ImageData(new Uint8ClampedArray(array), width, height);
  },

  putImageData: function(imageData, x, y) {
    if (arguments.length < 3) {
      throw new Error('Not enough arguments to CanvasContext.putImageData');
    }
    this._flush();
    this._gc._nativeCall('putImageData', {
      data: imageData.data,
      width: imageData.width,
      height: imageData.height,
      x: x,
      y: y
    });
  },

  createImageData: function(width, height) {
    if (arguments[0] instanceof ImageData) {
      var data = arguments[0];
      width = data.width;
      height = data.height;
    } else if (arguments.length < 2) {
      throw new Error('Not enough arguments to CanvasContext.createImageData');
    }
    return new ImageData(width, height);
  },

  _init: function(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this._gc._nativeCall('init', {
      width: width,
      height: height,
      font: [['sans-serif'], 12, false, false],
      fillStyle: [0, 0, 0, 255],
      strokeStyle: [0, 0, 0, 255]
    });
  },

  _flush: function() {
    if (this._operations.length > 0) {
      this._gc._nativeCall('draw', {operations: this._operations});
      this._operations = [];
    }
  }

};

var properties = {
  lineWidth: {
    init: 1,
    encode: function(value) {
      if (value > 0) {
        return value;
      }
      throw new Error(value);
    },
    decode: passThrough
  },
  lineCap: {
    init: 'butt',
    values: toObject(['butt', 'round', 'square']),
    encode: checkValue,
    decode: passThrough
  },
  lineJoin: {
    init: 'miter',
    values: toObject(['bevel', 'miter', 'round']),
    encode: checkValue,
    decode: passThrough
  },
  fillStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString
  },
  strokeStyle: {
    init: [0, 0, 0, 255],
    encode: colorStringToArray,
    decode: colorArrayToString
  },
  textAlign: {
    init: 'start',
    values: toObject(['start', 'end', 'left', 'right', 'center']),
    encode: checkValue,
    decode: passThrough
  },
  textBaseline: {
    init: 'alphabetic',
    values: toObject(['top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom']),
    encode: checkValue,
    decode: passThrough
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
  var obj = {};
  array.forEach(function(name) {
    obj[name] = true;
  });
  return obj;
}

function createState() {
  var state = {};
  for (var name in properties) {
    state[name] = properties[name].init;
  }
  return state;
}

function defineProperty(context, name) {
  var prop = properties[name];
  Object.defineProperty(context, name, {
    get: function() {
      return prop.decode(context._state[name]);
    },
    set: function(value) {
      try {
        context._state[name] = prop.encode(value);
        context._operations.push([name, this._state[name]]);
      } catch (error) {
        console.warn('Unsupported value for ' + name + ': ' + value);
      }
    }
  });
}

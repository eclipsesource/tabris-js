/**
 * Copyright (c) 2014 EclipseSource. All rights reserved.
 */

(function() {

  tabris.CanvasContext = function(gc) {
    this._gc = gc;
    this._state = createState();
    this._savedStates = [];
    this._opCodes = [];
    this._newOpCodes = [];
    this._operations = [];
    this._ints = [];
    this._doubles = [];
    this._booleans = [];
    this._strings = [];

    this.canvas = {
      width: 0,
      height: 0,
      style: {}
    };
    for (var name in properties) {
      defineProperty(this, name);
    }
    tabris.on("flush", this._flush, this);
    gc.on("dispose", function() {
      tabris.off("flush", this._flush, this);
    }, this);
  };

  tabris.CanvasContext.prototype = {

    save: function() {
      this._pushOperation("save");
      this._savedStates.push(util.clone(this._state));
    },

    restore: function() {
      this._pushOperation("restore");
      this._state = this._savedStates.pop() || this._state;
    },

    // Path operations

    beginPath: function() {
      this._pushOperation("beginPath");
    },

    closePath: function() {
      this._pushOperation("closePath");
    },

    lineTo: function(x, y) {
      this._pushOperation("lineTo");
      this._doubles.push(x, y);
    },

    moveTo: function(x, y) {
      this._pushOperation("moveTo");
      this._doubles.push(x, y);
    },

    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
      this._pushOperation("bezierCurveTo");
      this._doubles.push(cp1x, cp1y, cp2x, cp2y, x, y);
    },

    quadraticCurveTo: function(cpx, cpy, x, y) {
      this._pushOperation("quadraticCurveTo");
      this._doubles.push(cpx, cpy, x, y);
    },

    rect: function(x, y, width, height) {
      this._pushOperation("rect");
      this._doubles.push(x, y, width, height);
    },

    arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
      this._pushOperation("arc");
      this._doubles.push(x, y, radius, startAngle, endAngle);
      this._booleans.push(!!anticlockwise);
    },

    // Transformations

    scale: function(x, y) {
      this._pushOperation("scale");
      this._doubles.push(x, y);
    },

    rotate: function(angle) {
      this._pushOperation("rotate");
      this._doubles.push(angle);
    },

    translate: function(x, y) {
      this._pushOperation("translate");
      this._doubles.push(x, y);
    },

    transform: function(a, b, c, d, e, f) {
      this._pushOperation("transform");
      this._doubles.push(a, b, c, d, e, f);
    },

    setTransform: function(a, b, c, d, e, f) {
      this._pushOperation("setTransform");
      this._doubles.push(a, b, c, d, e, f);
    },

    // Drawing operations

    clearRect: function(x, y, width, height) {
      this._pushOperation("clearRect");
      this._doubles.push(x, y, width, height);
    },

    fillRect: function(x, y, width, height) {
      this._pushOperation("beginPath");
      this._pushOperation("rect");
      this._doubles.push(x, y, width, height);
      this.fill();
    },

    strokeRect: function(x, y, width, height) {
      this._pushOperation("beginPath");
      this._pushOperation("rect");
      this._doubles.push(x, y, width, height);
      this.stroke();
    },

    fillText: function(text, x, y /* , maxWidth */) {
      this._pushOperation("fillText");
      this._strings.push(text);
      this._booleans.push(false, false, false);
      this._doubles.push(x, y);

    },

    strokeText: function(text, x, y /* , maxWidth */) {
      this._pushOperation("strokeText");
      this._strings.push(text);
      this._booleans.push(false, false, false);
      this._doubles.push(x, y);
    },

    fill: function() {
      this._pushOperation("fill");
    },

    stroke: function() {
      this._pushOperation("stroke");
    },

    measureText: function(text) {
      // TODO wire to native function
      return {width: text.length * 5 + 5};
    },

    _init: function(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this._gc.call("init", {
        width: width,
        height: height,
        font: [["sans-serif"], 12, false, false],
        fillStyle: [0, 0, 0, 255],
        strokeStyle: [0, 0, 0, 255]
      });
    },

    _flush: function() {
      if (this._operations.length > 0) {
        this._gc.call("draw", {packedOperations: [
          this._newOpCodes,
          this._operations,
          this._doubles,
          this._booleans,
          this._strings,
          this._ints
        ]});
        this._operations = [];
        this._doubles = [];
        this._booleans = [];
        this._strings = [];
        this._ints = [];
        this._newOpCodes = [];
      }
    },

    _pushOperation: function(operation) {
      if (this._opCodes.indexOf(operation) < 0) {
        this._newOpCodes.push(operation);
        this._opCodes.push(operation);
      }
      this._operations.push(this._opCodes.indexOf(operation));
    }
  };

  tabris.getContext = function(canvas, width, height) {
    if (!canvas._gc) {
      canvas._gc = tabris.create("GC", {parent: canvas});
    }
    if (!canvas._ctx) {
      canvas._ctx = tabris._nativeBridge.V8 ? new tabris.CanvasContext(canvas._gc)
                                            : new tabris.LegacyCanvasContext(canvas._gc);
    }
    canvas._ctx._init(width, height);
    return canvas._ctx;
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
      decode: passThrough,
      addOperations: function(context, value) {
        context._pushOperation("lineWidth");
        context._doubles.push(value);
      }
    },
    lineCap: {
      init: "butt",
      values: toObject(["butt", "round", "square"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._pushOperation("lineCap");
        context._strings.push(value);
      }
    },
    lineJoin: {
      init: "miter",
      values: toObject(["bevel", "miter", "round"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._pushOperation("lineJoin");
        context._strings.push(value);
      }
    },
    fillStyle: {
      init: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString,
      addOperations: function(context, value) {
        context._pushOperation("fillStyle");
        context._ints.push(value[0], value[1], value[2], value[3]);
      }
    },
    strokeStyle: {
      init: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString,
      addOperations: function(context, value) {
        context._pushOperation("strokeStyle");
        context._ints.push(value[0], value[1], value[2], value[3]);
      }
    },
    textAlign: {
      init: "start",
      values: toObject(["start", "end", "left", "right", "center"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._pushOperation("textAlign");
        context._strings.push(value);
      }
    },
    textBaseline: {
      init: "alphabetic",
      values: toObject(["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._pushOperation("textBaseline");
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
          prop.addOperations(context, context._state[name]);
        } catch (error) {
          console.warn("Unsupported value for " + name + ": " + value);
        }
      }
    });
  }

})();

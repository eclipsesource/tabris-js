(function() {

  tabris.registerType("_GC", {
    _type: "rwt.widgets.GC",
    _properties: {parent: "proxy"}
  });

  tabris.CanvasContext = function(gc) {
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
    for (var name in properties) {
      defineProperty(this, name);
    }
    tabris._on("flush", this._flush, this);
    gc._on("dispose", function() {
      tabris._off("flush", this._flush, this);
    }, this);
  };

  tabris.CanvasContext.prototype = {

    fillRect: function(x, y, width, height) {
      // TODO: delegate to native function, once it is implemented (#493)
      if (arguments.length < 4) {
        throw new Error("Not enough arguments to CanvasContext.fillRect");
      }
      this._pushOperation("beginPath");
      this._pushOperation("rect");
      this._doubles.push(x, y, width, height);
      this.fill();
    },

    strokeRect: function(x, y, width, height) {
      // TODO: delegate to native function, once it is implemented (#493)
      if (arguments.length < 4) {
        throw new Error("Not enough arguments to CanvasContext.strokeRect");
      }
      this._pushOperation("beginPath");
      this._pushOperation("rect");
      this._doubles.push(x, y, width, height);
      this.stroke();
    },

    measureText: function(text) {
      // TODO: delegate to native function, once it is implemented (#56)
      return {width: text.length * 5 + 5};
    },

    _init: function(width, height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this._gc._nativeCall("init", {
        width: width,
        height: height,
        font: [["sans-serif"], 12, false, false],
        fillStyle: [0, 0, 0, 255],
        strokeStyle: [0, 0, 0, 255]
      });
    },

    _flush: function() {
      if (this._operations.length > 0) {
        this._gc._nativeCall("draw", {packedOperations: [
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
    },

    _pushOperation: function(operation) {
      if (this._opCodes.indexOf(operation) < 0) {
        this._newOpCodes.push(operation);
        this._opCodes.push(operation);
      }
      this._operations.push(this._opCodes.indexOf(operation));
    }

  };

  // State operations

  defineMethod("save", 0, function() {
    this._savedStates.push(_.clone(this._state));
  });

  defineMethod("restore", 0, function() {
    this._state = this._savedStates.pop() || this._state;
  });

  // Path operations

  defineMethod("beginPath");

  defineMethod("closePath");

  defineMethod("lineTo", 2, function(x, y) {
    this._doubles.push(x, y);
  });

  defineMethod("moveTo", 2, function(x, y) {
    this._doubles.push(x, y);
  });

  defineMethod("bezierCurveTo", 6, function(cp1x, cp1y, cp2x, cp2y, x, y) {
    this._doubles.push(cp1x, cp1y, cp2x, cp2y, x, y);
  });

  defineMethod("quadraticCurveTo", 4, function(cpx, cpy, x, y) {
    this._doubles.push(cpx, cpy, x, y);
  });

  defineMethod("rect", 4, function(x, y, width, height) {
    this._doubles.push(x, y, width, height);
  });

  defineMethod("arc", 5, function(x, y, radius, startAngle, endAngle, anticlockwise) {
    this._doubles.push(x, y, radius, startAngle, endAngle);
    this._booleans.push(!!anticlockwise);
  });

  // Transformations

  defineMethod("scale", 2, function(x, y) {
    this._doubles.push(x, y);
  });

  defineMethod("rotate", 1, function(angle) {
    this._doubles.push(angle);
  });

  defineMethod("translate", 2, function(x, y) {
    this._doubles.push(x, y);
  });

  defineMethod("transform", 6, function(a, b, c, d, e, f) {
    this._doubles.push(a, b, c, d, e, f);
  });

  defineMethod("setTransform", 6, function(a, b, c, d, e, f) {
    this._doubles.push(a, b, c, d, e, f);
  });

  // Drawing operations

  defineMethod("clearRect", 4, function(x, y, width, height) {
    this._doubles.push(x, y, width, height);
  });

  defineMethod("fillText", 3, function(text, x, y /* , maxWidth */) {
    this._strings.push(text);
    this._booleans.push(false, false, false);
    this._doubles.push(x, y);
  });

  defineMethod("strokeText", 3, function(text, x, y /* , maxWidth */) {
    this._strings.push(text);
    this._booleans.push(false, false, false);
    this._doubles.push(x, y);
  });

  defineMethod("fill");

  defineMethod("stroke");

  tabris.CanvasContext.getContext = function(canvas, width, height) {
    if (!canvas._gc) {
      canvas._gc = tabris.create("_GC", {parent: canvas});
    }
    if (!canvas._ctx) {
      canvas._ctx = device.platform === "Android" ? new tabris.CanvasContext(canvas._gc)
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
        context._doubles.push(value);
      }
    },
    lineCap: {
      init: "butt",
      values: toObject(["butt", "round", "square"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._strings.push(value);
      }
    },
    lineJoin: {
      init: "miter",
      values: toObject(["bevel", "miter", "round"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._strings.push(value);
      }
    },
    fillStyle: {
      init: [0, 0, 0, 255],
      encode: _.colorStringToArray,
      decode: _.colorArrayToString,
      addOperations: function(context, value) {
        context._ints.push(value[0], value[1], value[2], value[3]);
      }
    },
    strokeStyle: {
      init: [0, 0, 0, 255],
      encode: _.colorStringToArray,
      decode: _.colorArrayToString,
      addOperations: function(context, value) {
        context._ints.push(value[0], value[1], value[2], value[3]);
      }
    },
    textAlign: {
      init: "start",
      values: toObject(["start", "end", "left", "right", "center"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
        context._strings.push(value);
      }
    },
    textBaseline: {
      init: "alphabetic",
      values: toObject(["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"]),
      encode: checkValue,
      decode: passThrough,
      addOperations: function(context, value) {
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

  function defineMethod(name, reqArgCount, fn) {
    tabris.CanvasContext.prototype[name] = function() {
      if (reqArgCount && arguments.length < reqArgCount) {
        throw new Error("Not enough arguments to CanvasContext." + name);
      }
      this._pushOperation(name);
      if (fn) {
        fn.apply(this, arguments);
      }
    };
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
          context._pushOperation(name);
          prop.addOperations(context, context._state[name]);
        } catch (error) {
          console.warn("Unsupported value for " + name + ": " + value);
        }
      }
    });
  }

}());

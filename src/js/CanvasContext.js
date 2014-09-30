/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.CanvasContext = function(gc) {
    this._gc = gc;
    this._state = createState();
    this._savedStates = [];
    this._operations = [];
    this.canvas = {
      width: 0,
      height: 0
    };
    for (var name in properties) {
      defineProperty(this, name);
    }
    tabris.on("flush", this._flush, this);
    gc.on("Dispose", function() {
      tabris.off("flush", this._flush, this);
    }, this);
  };

  tabris.CanvasContext.prototype = {

    save: function() {
      this._operations.push(["save"]);
      this._savedStates.push(util.clone(this._state));
    },

    restore: function() {
      this._operations.push(["restore"]);
      this._state = this._savedStates.pop() || this._state;
    },

    // Path operations

    beginPath: function() {
      this._operations.push(["beginPath"]);
    },

    closePath: function() {
      this._operations.push(["closePath"]);
    },

    lineTo: function(x, y) {
      this._operations.push(["lineTo", x, y]);
    },

    moveTo: function(x, y) {
      this._operations.push(["moveTo", x, y]);
    },

    bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
      this._operations.push(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
    },

    quadraticCurveTo: function(cpx, cpy, x, y) {
      this._operations.push(["quadraticCurveTo", cpx, cpy, x, y]);
    },

    rect: function(x, y, width, height) {
      this._operations.push(["rect", x, y, width, height]);
    },

    arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
      this._operations.push(["arc", x, y, radius, startAngle, endAngle, !!anticlockwise]);
    },

    // Transformations

    scale: function(x, y) {
      this._operations.push(["scale", x, y]);
    },

    rotate: function(angle) {
      this._operations.push(["rotate", angle]);
    },

    translate: function(x, y) {
      this._operations.push(["translate", x, y]);
    },

    transform: function(a, b, c, d, e, f) {
      this._operations.push(["transform", a, b, c, d, e, f]);
    },

    setTransform: function(a, b, c, d, e, f) {
      this._operations.push(["setTransform", a, b, c, d, e, f]);
    },

    // Drawing operations

    clearRect: function(x, y, width, height) {
      this._operations.push(["clearRect", x, y, width, height]);
    },

    fillRect: function(x, y, width, height) {
      this._operations.push(["beginPath"], ["rect", x, y, width, height]);
      this.fill();
    },

    strokeRect: function(x, y, width, height) {
      this._operations.push(["beginPath"], ["rect", x, y, width, height]);
      this.stroke();
    },

    fillText: function(text, x, y /*, maxWidth*/) {
      this._operations.push(["fillText", text, false, false, false, x, y]);
    },

    strokeText: function(text, x, y /*, maxWidth*/) {
      this._operations.push(["strokeText", text, false, false, false, x, y]);
    },

    fill: function() {
      this._operations.push(["fill"]);
    },

    stroke: function() {
      this._operations.push(["stroke"]);
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
        this._gc.call("draw", {operations: this._operations});
        this._operations = [];
      }
    }

  };

  tabris.getContext = function(canvas, width, height) {
    if (!canvas._gc) {
      canvas._gc = canvas.append("GC", {});
    }
    if (!canvas._ctx) {
      canvas._ctx = new tabris.CanvasContext(canvas._gc);
    }
    canvas._ctx._init(width, height);
    return canvas._ctx;
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
      init: "butt",
      values: toObject(["butt", "round", "square"]),
      encode: checkValue,
      decode: passThrough
    },
    lineJoin: {
      init: "miter",
      values: toObject(["bevel", "miter", "round"]),
      encode: checkValue,
      decode: passThrough
    },
    fillStyle: {
      init: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString
    },
    strokeStyle: {
      init: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString
    },
    textAlign: {
      init: "start",
      values: toObject(["start", "end", "left", "right", "center"]),
      encode: checkValue,
      decode: passThrough
    },
    textBaseline: {
      init: "alphabetic",
      values: toObject(["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"]),
      encode: checkValue,
      decode: passThrough
    }
  };

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
          console.warn("Unsupported value for " + name + ": " + value);
        }
      }
    });
  }

})();

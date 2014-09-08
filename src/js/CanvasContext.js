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
    for(var name in properties) {
      defineProperty(this, name);
    }
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

    clearRect: function(x, y, width, height) {
      this._operations.push(["clearRect", x, y, width, height]);
      this._flush();
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
      this._flush();
    },

    strokeText: function(text, x, y /*, maxWidth*/) {
      this._operations.push(["strokeText", text, false, false, false, x, y]);
      this._flush();
    },

    fill: function() {
      this._operations.push(["fill"]);
      this._flush();
    },

    stroke: function() {
      this._operations.push(["stroke"]);
      this._flush();
    },

    _flush: function() {
      this._gc.call("draw", { "operations": this._operations });
      this._operations = [];
    }
  };

  tabris.getContext = function( canvas, width, height ) {
    if( !canvas._gc ) {
      canvas._gc = canvas.append("GC", {});
    }
    canvas._gc.call("init", {
      width: width,
      height: height,
      font: [["sans-serif"], 12, false, false],
      fillStyle: [0, 0, 0, 255],
      strokeStyle: [0, 0, 0, 255]
    });
    if( !canvas._ctx ) {
      canvas._ctx = new tabris.CanvasContext( canvas._gc );
    }
    return canvas._ctx;
  };

  function passThrough(value) {
    return value;
  }

  function checkValue(value) {
    if(value in this.values) {
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
      def: 1,
      encode: function(value) {
        if(value > 0) {
          return value;
        }
        throw new Error(value);
      },
      decode: passThrough
    },
    lineCap: {
      def: "butt",
      values: toObject(["butt", "round", "square"]),
      encode: checkValue,
      decode: passThrough
    },
    lineJoin: {
      def: "miter",
      values: toObject(["bevel", "miter", "round"]),
      encode: checkValue,
      decode: passThrough
    },
    fillStyle: {
      def: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString
    },
    strokeStyle: {
      def: [0, 0, 0, 255],
      encode: util.colorStringToArray,
      decode: util.colorArrayToString
    },
    textAlign: {
      def: "start",
      values: toObject(["start", "end", "left", "right", "center"]),
      encode: checkValue,
      decode: passThrough
    },
    textBaseline: {
      def: "alphabetic",
      values: toObject(["top", "hanging", "middle", "alphabetic", "ideographic", "bottom"]),
      encode: checkValue,
      decode: passThrough
    }
  };

  function createState() {
    var state = {};
    for(var name in properties) {
      state[name] = properties[name].def;
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
        } catch(error) {
          console.warn("Unsupported value for " + name + ": " + value);
        }
      }
    });
  }

})();

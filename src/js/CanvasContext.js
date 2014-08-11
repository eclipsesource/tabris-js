/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.CanvasContext = function(gc) {
    this._gc = gc;
    this._lineWidth = 1;
    this._lineCap = "butt";
    this._lineJoin = "miter";
    this._fillStyle = [0, 0, 0, 255];
    this._strokeStyle = [0, 0, 0, 255];
    this._operations = [];
    Object.defineProperty(this, "lineWidth", {
      get: function() {
        return this._lineWidth;
      },
      set: function(value) {
        if(value > 0) {
          this._lineWidth = value;
          this._operations.push(["lineWidth", value]);
        } else {
          console.warn("Unsupported value for lineWidth: " + value);
        }
      }
    });
    Object.defineProperty(this, "lineCap", {
      get: function() {
        return this._lineCap;
      },
      set: function(value) {
        if(value in validLineCaps) {
          this._lineCap = value;
          this._operations.push(["lineCap", value]);
        } else {
          console.warn("Unsupported value for lineCap: " + value);
        }
      }
    });
    Object.defineProperty(this, "lineJoin", {
      get: function() {
        return this._lineJoin;
      },
      set: function(value) {
        if(value in validLineJoins) {
          this._lineJoin = value;
          this._operations.push(["lineJoin", value]);
        } else {
          console.warn("Unsupported value for lineJoin: " + value);
        }
      }
    });
    Object.defineProperty(this, "fillStyle", {
      get: function() {
        return util.colorArrayToString(this._fillStyle);
      },
      set: function(str) {
        try {
          this._fillStyle = util.colorStringToArray(str);
          this._operations.push(["fillStyle", this._fillStyle]);
        } catch( error ) {
          console.warn("Unsupported value for fillStyle: " + str);
        }
      }
    });
    Object.defineProperty(this, "strokeStyle", {
      get: function() {
        return util.colorArrayToString(this._strokeStyle);
      },
      set: function(str) {
        try {
          this._strokeStyle = util.colorStringToArray(str);
          this._operations.push(["strokeStyle", this._strokeStyle]);
        } catch( error ) {
          console.warn("Unsupported value for strokeStyle: " + str);
        }
      }
    });
  };

  tabris.CanvasContext.prototype = {

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
      this._operations.push(["ellipse", x, y, radius, radius, 0, startAngle, endAngle, !!anticlockwise]);
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

  var validLineCaps ={ "butt": true, "round": true, "square": true };
  var validLineJoins ={ "bevel": true, "miter": true, "round": true };

})();

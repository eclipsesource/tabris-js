/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

tabris.Events = {

  on: function(type, callback, context) {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    var callbacks = this._callbacks[type] || (this._callbacks[type] = []);
    callbacks.push({
      fn: callback,
      ctx: context
    });
    return this;
  },

  off: function(type, callback, context) {
    if (this._callbacks) {
      if (!type) {
        delete this._callbacks;
      } else if (type in this._callbacks) {
        if (!callback) {
          delete this._callbacks[type];
        } else {
          var callbacks = this._callbacks[type];
          for (var i = callbacks.length - 1; i >= 0; i--) {
            if (callbacks[i].fn === callback && (!context || callbacks[i].ctx === context)) {
              callbacks.splice(i, 1);
            }
          }
          if (callbacks.length === 0) {
            delete this._callbacks[type];
            if (Object.keys(this._callbacks).length === 0) {
              delete this._callbacks;
            }
          }
        }
      }
    }
    return this;
  },

  trigger: function(type /*, args* */) {
    if (this._callbacks && type in this._callbacks) {
      var callbacks = this._callbacks[type];
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        callback.fn.apply(callback.ctx || this, args);
      }
    }
    return this;
  },

  _isListening: function(type) {
    return !!this._callbacks && (!type || type in this._callbacks);
  }

};

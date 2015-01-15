tabris.Events = {

  on: function(type, callback, context) {
    if (!this._callbacks) {
      this._callbacks = [];
    }
    this._callbacks[type] = (this._callbacks[type] || []).concat([{
      fn: callback,
      ctx: context
    }]);
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
          var callbacks = this._callbacks[type].concat();
          for (var i = callbacks.length - 1; i >= 0; i--) {
            if ((callbacks[i].fn === callback || callbacks[i].fn._callback === callback) &&
              (!context || callbacks[i].ctx === context))
            {
              callbacks.splice(i, 1);
            }
          }
          if (callbacks.length === 0) {
            delete this._callbacks[type];
            if (Object.keys(this._callbacks).length === 0) {
              delete this._callbacks;
            }
          } else {
            this._callbacks[type] = callbacks;
          }
        }
      }
    }
    return this;
  },

  once: function(type, callback, context) {
    var self = this;
    var wrappedCallback = function() {
      self.off(type, wrappedCallback, context);
      callback.apply(this, arguments);
    };
    wrappedCallback._callback = callback;
    return this.on(type, wrappedCallback, context);
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

util.extend(tabris, tabris.Events);

export default {

  on: function(type, callback, context) {
    return this._on(type, callback, context, true);
  },

  off: function(type, callback, context) {
    return this._off(type, callback, context, true);
  },

  _on: function(type, callback, context, isPublic) {
    var store = isPublic ? "_callbacks" : "_privateCallbacks";
    var wasListening = this._isListening(type);
    if (!this[store]) {
      this[store] = [];
    }
    this[store][type] = (this[store][type] || []).concat([
      {
        fn: callback,
        ctx: context
      }
    ]);
    if (!wasListening) {
      this._listen(type, true);
    }
    return this;
  },

  _off: function(type, callback, context, isPublic) {
    if (!type || !callback) {
      throw new Error("Not enough arguments");
    }
    var store = isPublic ? "_callbacks" : "_privateCallbacks";
    if (this[store]) {
      if (type in this[store]) {
        var callbacks = this[store][type].concat();
        for (var i = callbacks.length - 1; i >= 0; i--) {
          if ((callbacks[i].fn === callback || callbacks[i].fn._callback === callback) &&
            callbacks[i].ctx === context) {
            callbacks.splice(i, 1);
          }
        }
        if (callbacks.length === 0) {
          delete this[store][type];
          if (Object.keys(this[store]).length === 0) {
            delete this[store];
          }
        } else {
          this[store][type] = callbacks;
        }
      }
    }
    if (!this._isListening(type)) {
      this._listen(type, false);
    }
    return this;
  },

  once: function(type, callback, context) {
    var self = this;
    var wrappedCallback = function() {
      if (!self._isDisposed) {
        self.off(type, wrappedCallback, context);
      }
      callback.apply(this, arguments);
    };
    wrappedCallback._callback = callback;
    return this.on(type, wrappedCallback, context);
  },

  trigger: function(type /*, args* */) {
    if (!this._isDisposed) {
      var args = Array.prototype.slice.call(arguments, 1);
      this._callAll(type, args, false);
      this._callAll(type, args, true);
    }
    return this;
  },

  _callAll: function(type, args, isPublic) {
    var store = isPublic ? "_callbacks" : "_privateCallbacks";
    if (this[store] && type in this[store]) {
      var callbacks = this[store][type];
      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        callback.fn.apply(callback.ctx || this, args);
      }
    }
  },

  _isListening: function(type) {
    return (!!this._callbacks && (!type || type in this._callbacks)) ||
      (!!this._privateCallbacks && (!type || type in this._privateCallbacks));
  },

  _listen: function() {}

};

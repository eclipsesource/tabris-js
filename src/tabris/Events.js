export default {

  on: function(type, callback, context) {
    let wasListening = this._isListening(type);
    this._callbacks = this._callbacks || [];
    this._callbacks[type] = (this._callbacks[type] || []).concat();
    let alreadyAdded = this._callbacks[type].some(function(entry) {
      return (
        (entry.fn === callback || '_callback' in callback && entry.fn._callback === callback._callback) &&
        (entry.ctx === context)
      );
    });
    if (!alreadyAdded) {
      this._callbacks[type].push({fn: callback, ctx: context});
    }
    if (!wasListening) {
      this._listen(type, true);
    }
    return this;
  },

  off: function(type, callback, context) {
    if (!type || !callback) {
      throw new Error('Not enough arguments');
    }
    if (this._callbacks) {
      if (type in this._callbacks) {
        let callbacks = this._callbacks[type].concat();
        for (let i = callbacks.length - 1; i >= 0; i--) {
          if ((callbacks[i].fn === callback || callbacks[i].fn._callback === callback) &&
            callbacks[i].ctx === context) {
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
    if (!this._isListening(type)) {
      this._listen(type, false);
    }
    return this;
  },

  once: function(type, callback, context) {
    let self = this;
    let wrappedCallback = function() {
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
      let args = Array.prototype.slice.call(arguments, 1);
      this._callAll(type, args, false);
      this._callAll(type, args, true);
    }
    return this;
  },

  _callAll: function(type, args, isPublic) {
    let store = isPublic ? '_callbacks' : '_privateCallbacks';
    if (this[store] && type in this[store]) {
      let callbacks = this[store][type];
      for (let i = 0; i < callbacks.length; i++) {
        let callback = callbacks[i];
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

import {isObject} from './util';
import EventObject from './EventObject';

export default {

  on(type, callback, context) {
    if (isObject(type)) {
      for (let key in type) {
        this.on(key, type[key]);
      }
      return this;
    }
    let wasListening = this._isListening(type);
    this._callbacks = this._callbacks || [];
    this._callbacks[type] = (this._callbacks[type] || []).concat();
    let alreadyAdded = this._callbacks[type].some(entry => (
      (entry.fn === callback || '_callback' in callback && entry.fn._callback === callback._callback) &&
      (entry.ctx === context)
    ));
    if (!alreadyAdded) {
      this._callbacks[type].push({fn: callback, ctx: context});
    }
    if (!wasListening) {
      this._listen(type, true);
    }
    return this;
  },

  off(type, callback, context) {
    if (isObject(type)) {
      for (let key in type) {
        this.off(key, type[key]);
      }
      return this;
    }
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

  once(type, callback, context) {
    if (isObject(type)) {
      for (let key in type) {
        this.once(key, type[key]);
      }
      return this;
    }
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

  trigger(type, event = {}) {
    if (!this._isDisposed) {
      if (this._callbacks && type in this._callbacks) {
        if (event instanceof EventObject) {
          event._initEvent(type, this);
        }
        let callbacks = this._callbacks[type];
        for (let i = 0; i < callbacks.length; i++) {
          let callback = callbacks[i];
          callback.fn.call(callback.ctx || this, event);
        }
      }
    }
    return this;
  },

  _isListening(type) {
    return !!this._callbacks && (!type || type in this._callbacks);
  },

  _listen() {}

};

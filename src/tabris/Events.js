import {isObject} from './util';
import EventObject from './EventObject';
import {omit} from './util';
import {hint, toValueString} from './Console';
import {notify} from './symbols';
import {formatPromiseRejectionReason} from './util-stacktrace';

export default {

  on(type, callback, context) {
    if (isObject(type)) {
      for (const key in type) {
        this.on(key, type[key]);
      }
      return this;
    }
    if (typeof type !== 'string') {
      throw new Error(toValueString(type) + ' is not a string');
    }
    if (!(callback instanceof Function)) {
      throw new Error(toValueString(callback) + ' is not a function');
    }
    if (context && !(context instanceof Object)) {
      throw new Error(toValueString(context) + ' is not an object');
    }
    if (this._isDisposed) {
      hint(this, `Event registration warning: Can not listen for event "${type}" on disposed object`);
    }
    const wasListening = this._isListening(type);
    if (!this._callbacks) {
      Object.defineProperty(this, '_callbacks', {
        enumerable: false, writable: false, configurable: true, value: []
      });
    }
    this._callbacks[type] = (this._callbacks[type] || []).concat();
    const alreadyAdded = this._callbacks[type].some(entry => (
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
      for (const key in type) {
        this.off(key, type[key]);
      }
      return this;
    }
    if (!type || !callback) {
      throw new Error('Not enough arguments');
    }
    if (this._callbacks) {
      if (type in this._callbacks) {
        const callbacks = this._callbacks[type].concat();
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
      for (const key in type) {
        this.once(key, type[key]);
      }
      return this;
    }
    const self = this;
    /** @this {object} */
    const wrappedCallback = function() {
      if (!self._isDisposed) {
        self.off(type, wrappedCallback, context);
      }
      callback.apply(this, arguments);
    };
    wrappedCallback._callback = callback;
    return this.on(type, wrappedCallback, context);
  },

  trigger(type, eventData = {}) {
    return this[notify](type, eventData, false);
  },

  triggerAsync(type, eventData = {}) {
    return this[notify](type, eventData, true);
  },

  /**
   * @param {string} type
   * @param {object} eventData
   * @param {boolean} async
   * @returns {object|Promise<object>}
   */
  [notify](type, eventData, async) {
    const returnValues = [];
    if (!this._isDisposed) {
      if (this._callbacks && type in this._callbacks) {
        const uninitialized = (eventData instanceof EventObject) && !eventData.type;
        const dispatchObject = uninitialized ? eventData : new EventObject();
        const target = this.$eventTarget || this;
        if (eventData && (eventData !== dispatchObject)) {
          const copyData = omit(eventData, ['type', 'target', 'timeStamp']);
          Object.assign(dispatchObject, copyData);
        }
        if (dispatchObject._initEvent instanceof Function) {
          dispatchObject._initEvent(type, target);
        }
        for (const callback of this._callbacks[type]) {
          const value = callback.fn.call(callback.ctx || this, dispatchObject);
          if (value instanceof Promise) {
            value.catch(err => {
              console.error(
                `Listener for ${target.constructor.name} event "${type}" rejected: ${formatPromiseRejectionReason(err)}`
              );
            });
          }
          returnValues.push(value);
        }
      }
    } else {
      hint(this, `Trigger warning: Can not dispatch event "${type}" on disposed object`);
    }
    return async ? Promise.all(returnValues).then(() => this) : this;
  },

  _isListening(type) {
    return !!this._callbacks && (!type || type in this._callbacks);
  },

  /**
   * @param {string} type
   * @param {boolean} isListening
   */
  // eslint-disable-next-line no-unused-vars
  _listen(type, isListening) {}

};

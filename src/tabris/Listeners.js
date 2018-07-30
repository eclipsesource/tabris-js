import Events from './Events';
import NativeObject from './NativeObject';

const DELEGATE_FIELDS = ['reject', 'resolve', 'addListener', 'removeListener', 'once', 'trigger'];
const storeKey = Symbol('ListenersStore');

export default class Listeners {

  static getListenerStore(target) {
    if (target instanceof NativeObject) {
      return target;
    }
    if (!target[storeKey]) {
      target[storeKey] = Object.assign({$eventTarget: target}, Events);
    }
    return target[storeKey];
  }

  constructor(target, type) {
    this.store = Listeners.getListenerStore(target);
    const delegate = this.addListener.bind(this);
    delegate.target = this.target = target;
    delegate.type = this.type = type;
    delegate.original = this;
    for (let key of DELEGATE_FIELDS) {
      delegate[key] = this[key] = this[key].bind(this);
    }
    return delegate;
  }

  trigger(eventData) {
    this.store.trigger(this.type, eventData);
    return this.target;
  }

  reject(value) {
    return this.resolve().then(event => {
      let error = null;
      if (value instanceof Error) {
        error = value;
      }
      if (!error && value instanceof Function && value.prototype instanceof Error) {
        try {
          error = new value();
        } catch(ex) { /* that's OK, try something else */ }
      }
      if (!error && (!value || value instanceof Object)) {
        error = new Error(`${this.type} fired`);
        Object.assign(error, value || event);
      }
      if (!error) {
        error = new Error(value + '');
      }
      throw error;
    });
  }

  resolve(value) {
    let hasValue = typeof value !== 'undefined';
    return new Promise(resolve => {
      this.once(ev => {
        if (hasValue) {
          resolve(value);
        } else {
          resolve(ev);
        }
      });
    });
  }

  once(listener) {
    this.store.once(this.type, listener);
    return this.target;
  }

  addListener(listener) {
    this.store.on(this.type, listener);
    return this.target;
  }

  removeListener(listener) {
    this.store.off(this.type, listener);
    return this.target;
  }

}

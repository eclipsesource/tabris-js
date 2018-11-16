import Events from './Events';

const DELEGATE_FIELDS = ['promise', 'addListener', 'removeListener', 'once', 'trigger'];
const storeKey = Symbol('ListenersStore');

export default class Listeners {

  static getListenerStore(target) {
    // NOTE: we do not use an instanceof NativeObject check here since
    // importing NativeObject causes circular dependency issues
    if (target.on instanceof Function) {
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
    for (const key of DELEGATE_FIELDS) {
      delegate[key] = this[key] = this[key].bind(this);
    }
    return delegate;
  }

  trigger(eventData) {
    this.store.trigger(this.type, eventData);
    return this.target;
  }

  promise() {
    return new Promise(resolve => this.once(resolve));
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

import EventObject from './EventObject';
import {hint, toValueString} from './Console';
import {notify} from './symbols';
import {formatPromiseRejectionReason} from './util-stacktrace';

type ListenersDic = {[event: string]: Callback};
type Callback = Function & {_callback?: Function};
type CallbacksStore = {[event: string]: Array<{fn: Callback, ctx?: object}>};

export class EventsClass {

  protected _isDisposed?: boolean;
  protected _callbacks?: CallbacksStore;
  protected $eventTarget?: object;

  public on(listeners: ListenersDic): this;
  public on(type: string, callback?: Callback, context?: object): this;
  public on(type: string | ListenersDic, callback?: Callback, context?: object): this {
    if (type instanceof Object) {
      for (const key in type) {
        this.on(key, type[key]);
      }
      return this;
    }
    assertType(type);
    assertCallback(callback);
    assertContext(context);
    if (this._isDisposed) {
      hint(this, `Event registration warning: Can not listen for event "${type}" on disposed object`);
    }
    const wasListening = this._isListening(type);
    if (!this._callbacks) {
      Object.defineProperty(this, '_callbacks', {
        enumerable: false, writable: false, configurable: true, value: []
      });
    }
    this._callbacks![type] = (this._callbacks![type] || []).concat();
    const alreadyAdded = this._callbacks![type].some(entry => (
      (entry.fn === callback || '_callback' in callback && entry.fn._callback === callback._callback) &&
      (entry.ctx === context)
    ));
    if (!alreadyAdded) {
      this._callbacks![type].push({fn: callback, ctx: context});
    }
    if (!wasListening) {
      this._listen(type, true);
    }
    return this;
  }

  public off(listeners: ListenersDic): this;
  public off(type: string, callback?: Callback, context?: object): this;
  public off(type: string | ListenersDic, callback?: Callback, context?: object): this {
    if (type instanceof Object) {
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
  }

  public once(listeners: ListenersDic): this;
  public once(type: string, callback?: Callback, context?: object): this;
  public once(type: string | ListenersDic, callback?: Callback, context?: object): this {
    if (type instanceof Object) {
      for (const key in type) {
        this.once(key, type[key]);
      }
      return this;
    }
    assertCallback(callback);
    const self = this;
    const wrappedCallback = function(this: object) {
      if (!self._isDisposed) {
        self.off(type, wrappedCallback, context);
      }
      callback.apply(this, arguments);
    };
    wrappedCallback._callback = callback;
    return this.on(type, wrappedCallback, context);
  }

  public trigger(type: string, eventData = {}) {
    return this[notify](type, eventData, false);
  }

  public async triggerAsync(type: string, eventData = {}) {
    return this[notify](type, eventData, true);
  }

  protected [notify](type: string, eventData: object, async: boolean): object | Promise<object> {
    const returnValues = [];
    if (!this._isDisposed) {
      let dispatchObject: EventObject | null = null;
      if (this._callbacks && type in this._callbacks) {
        dispatchObject = EventObject.create(this, type, eventData);
        for (const callback of this._callbacks[type]) {
          const value = callback.fn.call(callback.ctx || this, dispatchObject);
          if (value instanceof Promise) {
            value.catch(err => {
              console.error(
                `Listener for ${dispatchObject!.target.constructor.name} event `
                + `"${type}" rejected: ${formatPromiseRejectionReason(err)}`
              );
            });
          }
          returnValues.push(value);
        }
      }
      if (this._callbacks && '*' in this._callbacks) {
        for (const callback of this._callbacks['*']) {
          callback.fn.call(callback.ctx || this, {target: this, type, eventData, dispatchObject});
        }
      }
    } else {
      hint(this, `Trigger warning: Can not dispatch event "${type}" on disposed object`);
    }
    return async ? Promise.all(returnValues).then(() => this) : this;
  }

  protected _isListening(type: string) {
    return !!this._callbacks && (!type || type in this._callbacks);
  }

  // eslint-disable-next-line
  protected _listen(type: string, isListening: boolean) { }

}

const EventsMixin: Partial<EventsClass> = {};
Reflect.ownKeys(EventsClass.prototype).forEach(member => {
  if (member !== 'constructor') {
    EventsMixin[member as keyof EventsClass] = (EventsClass.prototype as any)[member];
  }
});
export default EventsMixin as typeof EventsClass.prototype;

function assertCallback(callback: any): asserts callback is Callback {
  if (!(callback instanceof Function)) {
    throw new Error(toValueString(callback) + ' is not a function');
  }
}

function assertType(type: any): asserts type is string {
  if (typeof type !== 'string') {
    throw new Error(toValueString(type) + ' is not a string');
  }
}

function assertContext(context: any): asserts context is null | object {
  if (context && !(context instanceof Object)) {
    throw new Error(toValueString(context) + ' is not an object');
  }
}

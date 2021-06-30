import {hint, toValueString} from './Console';
import EventObject from './EventObject';
import {notify} from './symbols';
import {formatPromiseRejectionReason} from './util-stacktrace';

type ListenersDic = {[event: string]: Callback};
type Callback = Function & {_callback?: Function};
type CallbackEntry ={fn: Callback, ctx?: object};
type CallbacksStore = {[event: string]: CallbackEntry[]};

export class EventsClass {

  _isDisposed?: boolean;
  _callbacks!: CallbacksStore;
  $eventTarget?: object;

  /**
   * Register a listener(s) for the given event types.
   *
   * Within the framework "internal" listeners should be used if possible for
   * frequently dispatched events to improve performance.
   * A listener becomes "internal" by pre-fixing the event name with "_"
   * upon registration: E.g. '_foo' will be an internal listener for 'foo'.
   * It will be notified with a simplified event object that is not an
   * instance of EventObject, but has all event data except "timestamp".
   * It also does not support setting preventDefault. Internal listeners are
   * notified *after* regular listeners for the same type. If an instance of
   * EventObject was created for them it will be provided as "dispatchObject".
   *
   * The '*' event catches all dispatched events and is also "internal".
   */
  on(listeners: ListenersDic): this;
  on(type: string, callback?: Callback, context?: object): this;
  on(type: string | ListenersDic, callback?: Callback, context?: object): this {
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
    this._callbacks[type] = (this._callbacks[type] || []).concat();
    const alreadyAdded = this._callbacks![type].some(entry => (
      (entry.fn === callback || '_callback' in callback && entry.fn._callback === callback._callback) &&
      (entry.ctx === context)
    ));
    if (!alreadyAdded) {
      this._callbacks[type].push({fn: callback, ctx: context});
    }
    if (!wasListening) {
      this._listen(stripPrefix(type), true);
    }
    return this;
  }

  public off(listeners?: ListenersDic): this;
  public off(type: string, callback?: Callback, context?: object): this;
  public off(type?: string | ListenersDic, callback?: Callback, context?: object): this {
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
        } else {
          this._callbacks[type] = callbacks;
        }
      }
    }
    if (!this._isListening(type)) {
      this._listen(stripPrefix(type), false);
    }
    return this;
  }

  once(listeners: ListenersDic): this;
  once(type: string, callback?: Callback, context?: object): this;
  once(type: string | ListenersDic, callback?: Callback, context?: object): this {
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

  trigger(type: string, eventData = {}) {
    this[notify](type, eventData, false);
    return this;
  }

  async triggerAsync(type: string, eventData = {}) {
    await this[notify](type, eventData, true);
    return this;
  }

  [notify](type: string, eventData: object, async: boolean): object | null | Promise<object | null> {
    if (this._isDisposed) {
      hint(this, `Trigger warning: Can not dispatch event "${type}" on disposed object`);
      return null;
    }
    const returnValues = [];
    let dispatchObject: EventObject | null = null;
    if (!this._callbacks) {
      this._callbacks = {};
    }
    if (type in this._callbacks) {
      dispatchObject = EventObject.create(this, type, eventData);
      for (const callback of this._callbacks![type]) {
        const value = notifyCallback(this, callback, dispatchObject);
        handlePromise(value, dispatchObject, type);
        returnValues.push(value);
      }
    }
    const internals = getInternalListeners(this, type);
    if (internals) {
      const minimalEventObject = {type, dispatchObject, target: this,  ...eventData};
      for (const callback of internals) {
        notifyCallback(this, callback, minimalEventObject);
      }
    }
    return async ? Promise.all(returnValues).then(() => dispatchObject) : dispatchObject;
  }

  _isListening(type: string) {
    if (!this._callbacks || !type) {
      return false;
    }
    return type in this._callbacks || ('_' + type) in this._callbacks;
  }

  // eslint-disable-next-line
  _listen(type: string, isListening: boolean) { }

}

const EventsMixin: Partial<EventsClass> = {};
Reflect.ownKeys(EventsClass.prototype).forEach(member => {
  if (member !== 'constructor') {
    (EventsMixin[member as keyof EventsClass] as any) = (EventsClass.prototype as any)[member];
  }
});
export default EventsMixin as typeof EventsClass.prototype;

function handlePromise(value: any, dispatchObject: EventObject | null, type: string) {
  if (value instanceof Promise) {
    value.catch(err => {
      console.error(
        `Listener for ${dispatchObject!.target.constructor.name} event `
        + `"${type}" rejected: ${formatPromiseRejectionReason(err)}`
      );
    });
  }
}

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

function getInternalListeners(target: EventsClass, type: string): CallbackEntry[] | void {
  const all = target._callbacks['*'];
  const _type = target._callbacks['_' + type];
  if (all && _type) {
    return all.concat(_type);
  }
  return all ?? _type;
}

function notifyCallback(target: object, callback: CallbackEntry, eventObject: object) {
  return callback.fn.call(callback.ctx || target, eventObject);
}

function stripPrefix(type: string) {
  if (!type.startsWith('_')) {
    return type;
  }
  return type.slice(1);
}

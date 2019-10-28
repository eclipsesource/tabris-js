const PHASE_CONSTANTS = {
  NONE: {value: 0},
  CAPTURING_PHASE: {value: 1},
  AT_TARGET: {value: 2},
  BUBBLING_PHASE: {value: 3},
};

export default class Event {

  constructor(type, config) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments to Event');
    }
    Object.defineProperties(this, {
      $timeStamp: {enumerable: false, writable: true, value: Date.now()},
      $type: {enumerable: false, writable: true, value: type || ''},
      $bubbles: {enumerable: false, writable: true, value: config && !!config.bubbles || false},
      $cancelable: {enumerable: false, writable: true, value: config && !!config.cancelable || false},
      $target: {enumerable: false, writable: true, value: null},
      $defaultPrevented: {enumerable: false, writable: true, value: false},
    });
  }

  initEvent(type, bubbles, cancelable) {
    if (arguments.length < 3) {
      throw new Error('Not enough arguments to initEvent');
    }
    this.$type = type + '';
    this.$bubbles = !!bubbles;
    this.$cancelable = !!cancelable;
  }

  get type() {
    return this.$type;
  }

  get timeStamp() {
    return this.$timeStamp;
  }

  get bubbles() {
    return this.$bubbles;
  }

  get cancelable() {
    return this.$cancelable;
  }

  get target() {
    return this.$target;
  }

  get currentTarget() {
    return this.$target;
  }

  get defaultPrevented() {
    return this.$defaultPrevented;
  }

  get eventPhase() {
    return 0;
  }

  get isTrusted() {
    return false;
  }

  stopPropagation() {
  }

  stopImmediatePropagation() {
  }

  preventDefault() {
    if (this.$cancelable) {
      this.$defaultPrevented = true;
    }
  }

}

Object.defineProperties(Event, PHASE_CONSTANTS);
Object.defineProperties(Event.prototype, PHASE_CONSTANTS);

export function addDOMEventTargetMethods(target) {

  if (typeof target.addEventListener === 'function') {
    return;
  }

  let listeners;

  target.addEventListener = function(type, listener /*, useCapture*/) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to addEventListener');
    }
    if (!listeners) {
      listeners = [];
    }
    if (!(type in listeners)) {
      listeners[type] = [];
    }
    if (!listeners[type].includes(listener)) {
      listeners[type].push(listener);
    }
  };

  target.removeEventListener = function(type, listener /*, useCapture*/) {
    if (arguments.length < 2) {
      throw new Error('Not enough arguments to removeEventListener');
    }
    if (listeners && type in listeners) {
      const index = listeners[type].indexOf(listener);
      if (index !== -1) {
        listeners[type].splice(index, 1);
      }
    }
  };

  target.dispatchEvent = function(event) {
    if (arguments.length < 1) {
      throw new Error('Not enough arguments to dispatchEvent');
    }
    if (!(event instanceof Event)) {
      throw new Error('Invalid event given to dispatchEvent');
    }
    event.$target = target;
    if (listeners && event.type in listeners) {
      for (const listener of listeners[event.type]) {
        listener.call(this, event);
      }
    }
    return !event.defaultPrevented;
  };

}

export function defineEventHandlerProperties(target, types) {
  types.forEach(type => defineEventHandlerProperty(target, type));
}

function defineEventHandlerProperty(target, type) {
  const handler = 'on' + type;
  let listener = null;
  Object.defineProperty(target, handler, {
    get() {
      return listener;
    },
    set(value) {
      // ignore other types, mimicks the behavior of Firefox and Chromium
      if (typeof value === 'function') {
        if (listener) {
          target.removeEventListener(type, listener);
        }
        listener = value;
        target.addEventListener(type, listener);
      }
    }
  });
}


/* eslint-disable no-shadow */
/**
 * Implementation based on https://github.com/then/promise
 *
 * Original work Copyright (c) 2014 Forbes Lindesay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function asap(fn) {
  setTimeout(fn, 0);
}

// --- core.js ---

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// to avoid using try/catch inside critical functions, we
// extract them to here.
let LAST_ERROR = null;
const IS_ERROR = {};

function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

// Promise may be used before tabris is initialized:
function getStackTraceStack() {
  return global.tabris ? global.tabris._stackTraceStack : [];
}

function setStackTraceStack(value) {
  if (global.tabris) {
    global.tabris._stackTraceStack = value;
  }
}

export default function Promise(fn) {
  const stackTraceStack = [new Error().stack].concat(getStackTraceStack());
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  Object.defineProperties(this, {
    _deferredState: {value: 0, writable: true},
    _state: {value: 0, writable: true},
    _value: {value: null, writable: true},
    _stackTraceStack: {value: stackTraceStack, writable: false},
    _deferreds: {value: null, writable: true}
  });
  if (fn === noop) {return;}
  doResolve(fn, this);
}
Promise._onHandle = null;
Promise._onReject = null;
Promise._noop = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  const res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor((resolve, reject) => {
    const res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}

function handle(self, deferred) {
  while (self._state === 3) {
    self = self._value;
  }
  if (Promise._onHandle) {
    Promise._onHandle(self);
  }
  if (self._state === 0) {
    if (self._deferredState === 0) {
      self._deferredState = 1;
      self._deferreds = deferred;
      return;
    }
    if (self._deferredState === 1) {
      self._deferredState = 2;
      self._deferreds = [self._deferreds, deferred];
      return;
    }
    self._deferreds.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(() => {
    const cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._state === 1) {
        resolve(deferred.promise, self._value);
      } else {
        reject(deferred.promise, self._value);
      }
      return;
    }
    const oldStack = getStackTraceStack();
    setStackTraceStack(self._stackTraceStack);
    const ret = tryCallOne(cb, self._value);
    setStackTraceStack(oldStack);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}

function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    const then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._state = 3;
      self._value = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._state = 1;
  self._value = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._state = 2;
  self._value = newValue;
  if (Promise._onReject) {
    Promise._onReject(self, newValue);
  }
  finale(self);
}

function finale(self) {
  if (self._deferredState === 1) {
    handle(self, self._deferreds);
    self._deferreds = null;
  }
  if (self._deferredState === 2) {
    for (let i = 0; i < self._deferreds.length; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }
}

function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  let done = false;
  const res = tryCallTwo(fn, (value) => {
    if (done) {return;}
    done = true;
    resolve(promise, value);
  }, (reason) => {
    if (done) {return;}
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

// --- es6-extensions.js ---

// This file contains the ES6 extensions to the core Promises/A+ API

/* Static Functions */

function valuePromise(value) {
  const p = new Promise(Promise._noop);
  p._state = 1;
  p._value = value;
  return p;
}
Promise.resolve = function(value) {
  if (value instanceof Promise) {return value;}
  if (value === null) {
    return valuePromise(null);
  }
  if (typeof value === 'object' || typeof value === 'function') {
    try {
      const then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise((resolve, reject) => reject(ex));
    }
  }
  return valuePromise(value);
};

Promise.all = function(arr) {
  const args = Array.prototype.slice.call(arr);
  return new Promise((resolve, reject) => {
    if (args.length === 0) {return resolve([]);}
    let remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._state === 3) {
            val = val._value;
          }
          if (val._state === 1) {return res(i, val._value);}
          if (val._state === 2) {reject(val._value);}
          val.then(val => res(i, val), reject);
          return;
        } else {
          const then = val.then;
          if (typeof then === 'function') {
            const p = new Promise(then.bind(val));
            p.then(val => res(i, val), reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (let i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function(value) {
  return new Promise((resolve, reject) => reject(value));
};

Promise.race = function(values) {
  return new Promise((resolve, reject) => values.forEach(value => Promise.resolve(value).then(resolve, reject)));
};

/* Prototype Methods */

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

/* Inspection Methods */

export function isPending(promise) {
  return promise._state === 0;
}

export function isRejected(promise) {
  return promise._state === 2;
}

export function getPromiseResult(promise) {
  return promise._value;
}

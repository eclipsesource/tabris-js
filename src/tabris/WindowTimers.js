export function addWindowTimerMethods(target) {

  if (typeof target.setTimeout === 'function') {
    return;
  }

  let idSequence = 0;

  function createTimer(fn, delay, repeat, args) {
    const stackTraceStack = [new Error().stack].concat(tabris._stackTraceStack);
    const id = idSequence++;
    // If tabris is not ready, create the timer on load.
    // However, clearTimeout won't work until after load.
    const create = () => tabris.app._nativeCall('startTimer', {
      id, delay, repeat, callback: () => {
        const oldStack = tabris._stackTraceStack;
        tabris._stackTraceStack = stackTraceStack;
        fn.apply(target, args);
        tabris.trigger('flush');
        tabris._stackTraceStack = oldStack;
      }
    });
    if (tabris.started) {
      create();
    } else {
      tabris.once('start', create);
    }
    return id;
  }

  target.setTimeout = function(fn, delay) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to setTimeout');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('Illegal argument to setTimeout: not a function');
    }
    const args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), false, args);
  };

  target.setInterval = function(fn, delay) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to setInterval');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('Illegal argument to setInterval: not a function');
    }
    const args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), true, args);
  };

  target.clearTimeout = target.clearInterval = id => tabris.app._nativeCall('cancelTimer', {id});

}

function adjustDelay(value) {
  return typeof value === 'number' && isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

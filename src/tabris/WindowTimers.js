export function addWindowTimerMethods(target) {

  if (typeof target.setTimeout === 'function') {
    return;
  }

  let idSequence = 0;

  function createTimer(fn, delay, repeat, args) {
    let id = idSequence++;
    // If tabris is not ready, create the timer on load.
    // However, clearTimeout won't work until after load.
    let create = () => tabris.app._nativeCall('startTimer', {
      id, delay, repeat, callback: () => {
        fn.apply(target, args);
        tabris.trigger('flush');
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
    let args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), false, args);
  };

  target.setInterval = function(fn, delay) {
    if (arguments.length < 1) {
      throw new TypeError('Not enough arguments to setInterval');
    }
    if (typeof fn !== 'function') {
      throw new TypeError('Illegal argument to setInterval: not a function');
    }
    let args = Array.prototype.slice.call(arguments, 2);
    return createTimer(fn, adjustDelay(delay), true, args);
  };

  target.clearTimeout = target.clearInterval = id => tabris.app._nativeCall('cancelTimer', {id});

}

function adjustDelay(value) {
  return typeof value === 'number' && isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

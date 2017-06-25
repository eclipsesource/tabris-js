import NativeObject from './NativeObject';

class Timer extends NativeObject {

  constructor(properties) {
    super();
    this._create('tabris.Timer', properties);
    this._nativeListen('run', true);
  }

}

NativeObject.defineProperties(Timer.prototype, {delay: 'any', repeat: 'any'});

export function addWindowTimerMethods(target) {

  if (typeof target.setTimeout === 'function') {
    return;
  }

  let taskSequence = 0;
  let timers = {};

  function createTimer(fn, delay, repeat, args) {
    let taskId = taskSequence++;
    // If tabris is not ready, create the timer on load.
    // However, clearTimeout won't work until after load.
    let create = () => {
      let timer = new Timer({
        delay,
        repeat
      }).on('run', () => {
        fn.apply(target, args);
        if (!repeat) {
          timer.dispose();
          delete timers[taskId];
        }
      });
      timer._nativeCall('start');
      timers[taskId] = timer;
    };
    if (tabris.started) {
      create();
    } else {
      tabris.once('start', create);
    }
    return taskId;
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

  target.clearTimeout = target.clearInterval = function(taskId) {
    let timer = timers[taskId];
    if (timer) {
      timer._nativeCall('cancel', {});
      timer.dispose();
      delete timers[taskId];
    }
  };

  let lastTime = Date.now(), fps = 50/3;
  target.performance = {
	now () {
		return (Date.now() - lastTime) + (Math.random() * fps);
	}
  };

}

function adjustDelay(value) {
  return typeof value === 'number' && isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

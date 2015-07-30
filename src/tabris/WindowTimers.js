(function() {

  tabris.registerType("_Timer", {
    _type: "tabris.Timer",
    _events: {Run: true},
    _properties: {delay: true, repeat: true}
  });

  tabris._addWindowTimerMethods = function(target) {

    if (typeof target.setTimeout === "function") {
      return;
    }

    var taskSequence = 0;
    var timers = {};

    function createTimer(fn, delay, repeat, args) {
      var taskId = taskSequence++;
      // If tabris is not ready, create the timer on load.
      // However, clearTimeout won't work until after load.
      tabris.load(function() {
        var timer = tabris.create("_Timer", {
          delay: delay,
          repeat: repeat
        }).on("Run", function() {
          fn.apply(window, args);
          if (!repeat) {
            timer.dispose();
            delete timers[taskId];
          }
        });
        timer._nativeCall("start");
        timers[taskId] = timer;
      });
      return taskId;
    }

    target.setTimeout = function(fn, delay) {
      var args = Array.prototype.slice.call(arguments, 2);
      return createTimer(fn, adjustDelay(delay), false, args);
    };

    target.setInterval = function(fn, delay) {
      var args = Array.prototype.slice.call(arguments, 2);
      return createTimer(fn, adjustDelay(delay), true, args);
    };

    target.clearTimeout = target.clearInterval = function(taskId) {
      var timer = timers[taskId];
      if (timer) {
        timer._nativeCall("cancel", {});
        timer.dispose();
        delete timers[taskId];
      }
    };

  };

  if (typeof window !== "undefined") {
    tabris._addWindowTimerMethods(window);
  }

  function adjustDelay(value) {
    return typeof value === "number" && isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  }

})();

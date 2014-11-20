/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.registerType("_Timer", {
    _type: "tabris.Timer",
    _listen: {Run: true},
    _checkProperty: true
  });

  tabris._addWindowTimerMethods = function(target) {

    if (typeof target.setTimeout === "function") {
      return;
    }

    var taskSequence = 0;
    var timers = {};

    function createTimer(fn, delay, repeat) {
      var taskId = taskSequence++;
      // If tabris is not ready, create the timer on load.
      // However, clearTimeout won't work until after load.
      tabris.load(function() {
        var timer = tabris.create("_Timer", {
          delay: delay,
          repeat: repeat
        }).on("Run", function() {
          fn.call();
          if (!repeat) {
            timer.dispose();
            delete timers[taskId];
          }
        });
        timer.call("start");
        timers[taskId] = timer;
      });
      return taskId;
    }

    target.setTimeout = function(fn, delay) {
      return createTimer(fn, delay, false);
    };

    target.setInterval = function(fn, delay) {
      return createTimer(fn, delay, true);
    };

    target.clearTimeout = target.clearInterval = function(taskId) {
      var timer = timers[taskId];
      if (timer) {
        timer.call("cancel", {});
        timer.dispose();
        delete timers[taskId];
      }
    };

  };

  if (typeof window !== "undefined") {
    tabris._addWindowTimerMethods(window);
  }

})();

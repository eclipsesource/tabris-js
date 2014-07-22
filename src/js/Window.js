/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function(){

tabris.Window = function() {
};

tabris.Window.create = function() {

  var wnd = new tabris.Window();
  var taskSequence = 0;
  var timers = {};

  function createTimer( fn, delay, repeat ) {
    var taskId = taskSequence++;
    var timer = tabris.create( "tabris.Timer", {
      delay : delay,
      repeat: repeat
    }).on( "Run", function() {
      fn.call();
      if( !repeat ) {
        timer.dispose();
        delete timers[taskId];
      }
    });
    timers[taskId] = timer;
    return taskId;
  }

  wnd.setTimeout = function( fn, delay ) {
    return createTimer( fn, delay, false );
  };

  wnd.setInterval = function( fn, delay ) {
    return createTimer( fn, delay, true );
  };

  wnd.clearTimeout = wnd.clearInterval = function( taskId ) {
    var timer = timers[taskId];
    if( timer ) {
      timer.call( "cancel", {});
      timer.dispose();
      delete timers[taskId];
    }
  };

  return wnd;
};

}());
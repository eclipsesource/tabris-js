/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Window: false */

(function() {

  tabris._addWindowMethods = function( wnd ) {

    if( typeof wnd.setTimeout === "function" ) {
      return;
    }

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
      timer.call( "start" );
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

  };

  if( typeof Window === "function" ) {
    tabris._addWindowMethods( Window.prototype );
    tabris._addDOMEventTargetMethods( Window );
    if( !window.Event ) {
      window.Event = tabris.DOMEvent;
    }
  }

})();

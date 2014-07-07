/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global util: true */

util = {

  merge: function() {
    var result = {};
    for( var i = 0; i < arguments.length; i++ ) {
      var object = arguments[i];
      for( var name in object ) {
        result[name] = object[name];
      }
    }
    return result;
  },

  pick: function( object, keys ) {
    var result = {};
    for( var key in object ) {
      if( keys.indexOf( key ) !== -1 ) {
        result[key] = object[key];
      }
    }
    return result;
  },

  omit: function( object, keys ) {
    var result = {};
    for( var key in object ) {
      if( keys.indexOf( key ) === -1 ) {
        result[key] = object[key];
      }
    }
    return result;
  },

  bind: function( fn, context ) {
    return function() {
      return fn.apply( context, arguments );
    };
  }

};

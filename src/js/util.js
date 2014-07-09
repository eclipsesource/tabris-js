/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global util: true */

util = {

  extend: function( target ) {
    for( var i = 1; i < arguments.length; i++ ) {
      var source = arguments[i];
      for( var name in source ) {
        target[name] = source[name];
      }
    }
    return target;
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

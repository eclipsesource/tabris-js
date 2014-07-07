/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: true */

(function() {

  Tabris = {

    _loadFunctions: [],
    _proxies: {},

    load: function( fn ) {
      Tabris._loadFunctions.push( fn );
    },

    create: function( type, properties ) {
      if( !Tabris._nativeBridge ) {
        throw new Error( "tabris.js not started" );
      }
      var id = generateId();
      return Tabris.Proxy.create( id, type, properties );
    },

    _start: function( nativeBridge ) {
      Tabris._nativeBridge = nativeBridge;
      var i = 0;
      while( i < Tabris._loadFunctions.length ) {
        Tabris._loadFunctions[i++].call();
      }
    },

    _notify: function( id, event, param ) {
      var proxy = Tabris._proxies[ id ];
      if( proxy ) {
        proxy._notifyListeners( event, [param] );
      }
    }

  };

  var idSequence = 1;

  var generateId = function() {
    return "o" + ( idSequence++ );
  };

})();

/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: true */

(function() {

  tabris = {

    _loadFunctions: [],
    _proxies: {},

    load: function( fn ) {
      tabris._loadFunctions.push( fn );
    },

    create: function( type, properties ) {
      if( !tabris._nativeBridge ) {
        throw new Error( "tabris.js not started" );
      }
      var id = generateId();
      return new tabris.Proxy( id )._create( type, properties );
    },

    _start: function( nativeBridge ) {
      tabris._nativeBridge = nativeBridge;
      var i = 0;
      while( i < tabris._loadFunctions.length ) {
        tabris._loadFunctions[i++].call();
      }
    },

    _notify: function( id, event, param ) {
      var proxy = tabris._proxies[ id ];
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

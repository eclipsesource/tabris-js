/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: true */

(function() {

  tabris = util.extend( function( id ) {
    return id in tabris._proxies ? tabris._proxies[ id ] : new tabris.Proxy( id );
  }, {

    _loadFunctions: [],
    _proxies: {},

    load: function( fn ) {
      tabris._loadFunctions.push( fn );
    },

    create: function( type, properties ) {
      if( !tabris._nativeBridge ) {
        throw new Error( "tabris.js not started" );
      }
      return tabris.Proxy.create( type, properties );
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
    },

    _reset: function() {
      this._loadFunctions = [];
      this._proxies = {};
    }

  });

})();

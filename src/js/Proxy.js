/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.Proxy = function( id ) {
    this.id = id;
    tabris._proxies[id] = this;
  };

  tabris.Proxy.create = function( id, type, properties ) {
    return new tabris.Proxy( id )._create( type, properties );
  };

  tabris.Proxy.prototype = {

    _create: function( type, properties ) {
      if( properties && properties.parent ) {
        this._parent = properties.parent;
        this._parent._addChild( this );
      }
      tabris._nativeBridge.create( this.id, fixType( type ), fixProperties( properties ) );
      return this;
    },

    append: function( type, properties ) {
      this._checkDisposed();
      return tabris.create( type, util.extend( {}, properties, { parent: this } ) );
    },

    get: function( method ) {
      this._checkDisposed();
      return tabris._nativeBridge.get( this.id, method );
    },

    set: function( arg1, arg2 ) {
      this._checkDisposed();
      var properties;
      if( typeof arg1 === "string" ) {
        properties = {};
        properties[arg1] = arg2;
      } else {
        properties = arg1;
      }
      tabris._nativeBridge.set( this.id, fixProperties( properties ) );
      return this;
    },

    call: function( method, parameters ) {
      this._checkDisposed();
      tabris._nativeBridge.call( this.id, method, parameters );
      return this;
    },

    on: function( event, listener ) {
      this._checkDisposed();
      if( this._addListener( event, listener ) ) {
        tabris._nativeBridge.listen( this.id, event, true );
      }
      return this;
    },

    off: function( event, listener ) {
      this._checkDisposed();
      if( this._removeListener( event, listener ) ) {
        tabris._nativeBridge.listen( this.id, event, false );
      }
      return this;
    },

    dispose: function() {
      if( !this._isDisposed ) {
        tabris._nativeBridge.destroy( this.id );
        this._destroy();
        if( this._parent ) {
          this._parent._removeChild( this );
        }
        this._isDisposed = true;
      }
    },

    _destroy: function() {
      if( this._children ) {
        for( var i = 0; i < this._children.length; i++ ) {
          this._children[i]._destroy();
        }
      }
      this._notifyListeners( "Dispose", [{}] );
      this._listeners = null;
      delete tabris._proxies[this.id];
    },

    _addListener: function( event, listener ) {
      if( !this._listeners ) {
        this._listeners = [];
      }
      if( !( event in this._listeners ) ) {
        this._listeners[ event ] = [];
      }
      this._listeners[ event ].push( listener );
      return this._listeners[ event ].length === 1;
    },

    _removeListener: function( event, listener ) {
      if( this._listeners && event in this._listeners ) {
        var index = this._listeners[ event ].indexOf( listener );
        if( index !== -1 ) {
          this._listeners[ event ].splice( index, 1 );
          return this._listeners[ event ].length === 0;
        }
      }
      return false;
    },

    _notifyListeners: function( event, args ) {
      if( this._listeners && event in this._listeners ) {
        var listeners = this._listeners[event];
        for( var i = 0; i < listeners.length; i++ ) {
          listeners[i].apply( this, args );
        }
      }
    },

    _addChild: function( child ) {
      if( !this._children ) {
        this._children = [];
      }
      this._children.push( child );
    },

    _removeChild: function( child ) {
      if( this._children ) {
        var index = this._children.indexOf( child );
        if( index !== -1 ) {
          this._children.splice( index, 1 );
        }
      }
    },

    _checkDisposed: function() {
      if( this._isDisposed ) {
        throw new Error( "Object is disposed" );
      }
    }

  };

  var translateProxyToId = function( value ) {
    return value instanceof tabris.Proxy ? value.id : value;
  };

  var fixLayoutData = function( data ) {
    for( var key in data ) {
      if( Array.isArray( data[key] ) ) {
        for( var i = 0; i < data[key].length; i++ ) {
          data[key][i] = translateProxyToId( data[key][i] );
        }
      } else {
        data[key] = translateProxyToId( data[key] );
      }
    }
    return data;
  };

  var fixProperties = function( properties ) {
    for( var key in properties ) {
      if( key === "layoutData" ) {
        properties[key] = fixLayoutData( properties[key] );
      } else {
        properties[key] = translateProxyToId( properties[key] );
      }
    }
    return properties;
  };

  var fixType = function( type ) {
    if( type.indexOf( '.' ) === -1 ) {
      return "rwt.widgets." + type;
    }
    return type;
  };

})();

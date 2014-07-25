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
    var proxy = new tabris.Proxy( id );
    var factory = tabris.Proxy._factories[type in tabris.Proxy._factories ? type : "default"];
    return factory( proxy, type, properties );
  };

  tabris.Proxy._factories = {
    "Button": function( proxy, type, properties ) {
      return proxy._create( "rwt.widgets.Button", util.extend( { style: ["PUSH"] }, properties ));
    },
    "CheckBox": function( proxy, type, properties ) {
      return proxy._create( "rwt.widgets.Button", util.extend( { style: ["CHECK"] }, properties ));
    },
    "RadioButton": function( proxy, type, properties ) {
      return proxy._create( "rwt.widgets.Button", util.extend( { style: ["RADIO"] }, properties ));
    },
    "ToggleButton": function( proxy, type, properties ) {
      return proxy._create( "rwt.widgets.Button", util.extend( { style: ["TOGGLE"] }, properties ));
    },
    "Text": function( proxy, type, properties ) {
      var style = textTypeToStyle[ properties.type ] || textTypeToStyle[ "default" ];
      return proxy._create( "rwt.widgets.Text", util.extend( { style: style }, properties ));
    },
    "default": function( proxy, type, properties ) {
      return proxy._create( type, properties );
    }
  };

  tabris.Proxy.prototype = {

    _create: function( type, properties ) {
      if( properties && properties.parent ) {
        this._parent = properties.parent;
        this._parent._addChild( this );
      }
      tabris._nativeBridge.create( this.id, encodeType( type ), encodeProperties( properties ) );
      return this;
    },

    append: function( type, properties ) {
      this._checkDisposed();
      return tabris.create( type, util.extend( {}, properties, { parent: this } ) );
    },

    get: function( name ) {
      this._checkDisposed();
      return decodeProperty( name, tabris._nativeBridge.get( this.id, name ) );
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
      tabris._nativeBridge.set( this.id, encodeProperties( properties ) );
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

  function encodeProperties( properties ) {
    var result = {};
    for( var key in properties ) {
      result[key] = encodeProperty( key, properties[key] );
    }
    return result;
  }

  function encodeProperty( name, value ) {
    if( name === "foreground" || name === "background" ) {
      return encodeColor( value );
    } else if( name === "layoutData" ) {
      return encodeLayoutData( value );
    } else if( name === "rowTemplate" ) {
      return encodeRowTemplate( value );
    }
    return encodeProxyToId( value );
  }

  function encodeColor( value ) {
    return util.colorStringToArray( value );
  }

  function encodeRowTemplate( template ) {
    return template.map( encodeTemplateCell );
  }

  function encodeTemplateCell( cell ) {
    var result = {};
    for( var key in cell ) {
      if( key === "foreground" || key === "background" ) {
        result[key] = encodeColor( cell[key] );
      } else {
        result[key] = cell[key];
      }
    }
    return result;
  }

  function encodeLayoutData( layoutData ) {
    var result = {};
    for( var key in layoutData ) {
      if( Array.isArray( layoutData[key] ) ) {
        result[key] = layoutData[key].map( encodeProxyToId );
      } else {
        result[key] = encodeProxyToId( layoutData[key] );
      }
    }
    return result;
  }

  function encodeProxyToId( value ) {
    return value instanceof tabris.Proxy ? value.id : value;
  }

  function encodeType( type ) {
    if( type.indexOf( '.' ) === -1 ) {
      return "rwt.widgets." + type;
    }
    return type;
  }

  function decodeProperty( name, value ) {
    if( name === "foreground" || name === "background" ) {
      return decodeColor( value );
    }
    return value;
  }

  function decodeColor( value ) {
    return util.colorArrayToString( value );
  }

  var textTypeToStyle = {
    "password" : ["BORDER", "PASSWORD"],
    "search" : ["BORDER", "SEARCH"],
    "multiline" : ["BORDER", "MULTI"],
    "default" : ["BORDER"]
  };

})();

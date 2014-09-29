/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

(function() {

  tabris.Proxy = function( id ) {
    this.id = id || generateId();
    tabris._proxies[this.id] = this;
  };

  tabris.Proxy.create = function( type, properties ) {
    var factory = tabris.Proxy._factories[type in tabris.Proxy._factories ? type : "default"];
    return factory( type, properties );
  };

  tabris.Proxy._factories = {
    "Button": function( type, properties ) {
      return new tabris.Proxy()._create( "rwt.widgets.Button", util.extend( { style: ["PUSH"] }, properties ));
    },
    "CheckBox": function( type, properties ) {
      return new tabris.Proxy()._create( "rwt.widgets.Button", util.extend( { style: ["CHECK"] }, properties ));
    },
    "RadioButton": function( type, properties ) {
      return new tabris.Proxy()._create( "rwt.widgets.Button", util.extend( { style: ["RADIO"] }, properties ));
    },
    "ToggleButton": function( type, properties ) {
      return new tabris.Proxy()._create( "rwt.widgets.Button", util.extend( { style: ["TOGGLE"] }, properties ));
    },
    "Text": function( type, properties ) {
      var style = textTypeToStyle[ properties.type ] || textTypeToStyle[ "default" ];
      return new tabris.Proxy()._create( "rwt.widgets.Text", util.extend( { style: style }, properties ));
    },
    "default": function( type, properties ) {
      return new tabris.Proxy()._create( type, properties );
    }
  };

  util.extend(tabris.Proxy.prototype, tabris.Events, {

    _create: function( type, properties ) {
      if( properties && properties.parent ) {
        this._parent = properties.parent;
        this._parent._addChild( this );
      }
      tabris._nativeBridge.create( this.id, encodeType( type ), this._encodeProperties( properties ) );
      return this;
    },

    append: function( type, properties ) {
      this._checkDisposed();
      return tabris.create( type, util.extend( {}, properties, { parent: this } ) );
    },

    get: function( name ) {
      this._checkDisposed();
      return this._decodeProperty( name, tabris._nativeBridge.get( this.id, name ) );
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
      tabris._nativeBridge.set( this.id, this._encodeProperties( properties ) );
      return this;
    },

    call: function( method, parameters ) {
      this._checkDisposed();
      return tabris._nativeBridge.call( this.id, method, parameters );
    },

    on: function( event, listener, context ) {
      this._checkDisposed();
      var wasListening = this._isListening( event );
      tabris.Events.on.call( this, event, listener, context );
      if( !wasListening ) {
        tabris._nativeBridge.listen( this.id, event, true );
      }
      return this;
    },

    off: function( event, listener, context ) {
      this._checkDisposed();
      tabris.Events.off.call( this, event, listener, context );
      if( !this._isListening( event ) ) {
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
      this._destroyChildren();
      this.trigger( "Dispose", {} );
      tabris.Events.off.call( this );
      delete tabris._proxies[this.id];
    },

    _destroyChildren: function() {
      if( this._children ) {
        for( var i = 0; i < this._children.length; i++ ) {
          this._children[i]._destroy();
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
    },

    _encodeProperties: function( properties ) {
      var result = {};
      for( var key in properties ) {
        this._setProperty(key, properties[key], result);
      }
      return result;
    },

    _setProperty: function( name, value, target ) {
      try {
        target[name] = this._encodeProperty(name, value);
      } catch( error ) {
        console.warn( "Unsupported "+ name + " value: " + error.message );
      }
    },

    _encodeProperty: function( name, value ) {
      if( name === "foreground" || name === "background" ) {
        return encodeColor( value );
      } else if( name === "font" ) {
        return encodeFont( value );
      } else if( name === "layoutData" ) {
        checkLayoutData( value );
        return encodeLayoutData( value );
      }
      return encodeProxyToId( value );
    },

    _decodeProperty: function(name, value) {
      if (name === "foreground" || name === "background") {
        return decodeColor(value);
      } else if (name === "font") {
        return decodeFont(value);
      }
      return value;
    }
  });

  function encodeColor( value ) {
    return util.colorStringToArray( value );
  }

  function encodeFont( value ) {
    return util.fontStringToArray( value );
  }

  function decodeFont( value ) {
    return util.fontArrayToString( value );
  }

  function checkLayoutData( layoutData ) {
    if( !( "left" in layoutData ) && !( "right" in layoutData ) ) {
      throw new Error( "either left or right should be specified" );
    }
    if( !( "top" in layoutData ) && !( "bottom" in layoutData ) ) {
      throw new Error( "either top or bottom should be specified" );
    }
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

  function decodeColor( value ) {
    return util.colorArrayToString( value );
  }

  var idSequence = 1;

  function generateId() {
    return "o" + ( idSequence++ );
  }

  var textTypeToStyle = {
    "password" : ["BORDER", "PASSWORD"],
    "search" : ["BORDER", "SEARCH"],
    "multiline" : ["BORDER", "MULTI"],
    "default" : ["BORDER"]
  };

})();

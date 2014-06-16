/*global util: false, Tabris: true */
(function() {

  var _loadFunctions = [];

  Tabris = {

    load: function( fn ) {
      _loadFunctions.push( fn );
    },

    create: function( type, properties ) {
      if( !Tabris._nativeBridge ) {
        throw new Error( "tabris.js not started" );
      }
      var id = generateId();
      Tabris._nativeBridge.create( id, fixType( type ), fixProperties( properties ) );
      return new WidgetProxy( id );
    },

    createAction: function( properties, handler ) {
      var action = Tabris.create( "tabris.Action", util.merge( properties, {
        parent: Tabris._UI.id
      }));
      action.on( "Selection", handler );
      return action;
    },

    createPage: function( properties ) {
      var pageKeys = ['title', 'image', 'topLevel'];
      var compositeProperties = util.merge( util.omit( properties, pageKeys ), {
        parent: Tabris._shell.id,
        layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
      });
      var composite = Tabris.create( "rwt.widgets.Composite", compositeProperties );
      var pageProperties = util.merge( util.pick( properties, pageKeys ), {
        parent: Tabris._UI.id,
        control: composite.id
      });
      var page = Tabris.create( "tabris.Page", pageProperties );
      composite.open = function() {
        setActivePage( page );
      };
      composite.close = function() {
        composite.destroy();
        setLastActivePage();
        page.destroy();
      };
      page.close = composite.close;
      return composite;
    },

    _start: function( nativeBridge ) {
      Tabris._nativeBridge = nativeBridge;
      Tabris.create( "rwt.widgets.Display" );
      Tabris._shell = Tabris.create( "rwt.widgets.Shell", {
        style: ["NO_TRIM"],
        mode: "maximized",
        active: true,
        visibility: true
      });
      Tabris._UI = Tabris.create( "tabris.UI", {
        shell: Tabris._shell.id
      });
      Tabris._UI.on( "ShowPage", function( properties ) {
        var page = Tabris._proxies[ properties.pageId ];
        setActivePage( page );
      });
      Tabris._UI.on( "ShowPreviousPage", function() {
        getActivePage().close();
      });
      var i = 0;
      while( i < _loadFunctions.length ) {
        _loadFunctions[i++].call();
      }
      _loadFunctions = [];
    },

    _notify: function( id, event, param ) {
      var proxy = Tabris._proxies[ id ];
      if( proxy ) {
        proxy._notifyListeners( event, [param] );
      }
    },

    _proxies: {}

  };

  var WidgetProxy = function( id ) {
    this.id = id;
    this._listeners = {};
    Tabris._proxies[id] = this;
  };

  WidgetProxy.prototype = {

    get: function( method ) {
      return Tabris._nativeBridge.get( this.id, method );
    },

    set: function( arg1, arg2 ) {
      var properties;
      if( typeof arg1 === "string" ) {
        properties = {};
        properties[arg1] = arg2;
      } else {
        properties = arg1;
      }
      Tabris._nativeBridge.set( this.id, fixProperties( properties ) );
      return this;
    },

    call: function( method, parameters ) {
      Tabris._nativeBridge.call( this.id, method, parameters );
      return this;
    },

    on: function( event, listener ) {
      if( this._addListener( event, listener ) ) {
        Tabris._nativeBridge.listen( this.id, event, true );
      }
      return this;
    },

    off: function( event, listener ) {
      if( this._removeListener( event, listener ) ) {
        Tabris._nativeBridge.listen( this.id, event, false );
      }
      return this;
    },

    destroy: function() {
      this._notifyListeners( "Dispose", [{}] );
      Tabris._nativeBridge.destroy( this.id );
      this._listeners = null;
      delete Tabris._proxies[this.id];
    },

    append: function( type, properties ) {
      return Tabris.create( type, util.merge( properties, { parent: this.id } ) );
    },

    _addListener: function( event, listener ) {
      if( !( event in this._listeners ) ) {
        this._listeners[ event ] = [];
      }
      this._listeners[ event ].push( listener );
      return this._listeners[ event ].length === 1;
    },

    _removeListener: function( event, listener ) {
      if( event in this._listeners ) {
        var index = this._listeners[ event ].indexOf( listener );
        if( index !== -1 ) {
          this._listeners[ event ].splice( index, 1 );
          return this._listeners[ event ].length === 0;
        }
      }
      return false;
    },

    _notifyListeners: function( event, args ) {
      if( event in this._listeners ) {
        var listeners = this._listeners[event];
        for( var i = 0; i < listeners.length; i++ ) {
          listeners[i].apply( this, args );
        }
      }
    }

  };

  var translateWidgetToId = function( value ) {
    if( typeof value === 'object' && value.id ) {
      return value.id;
    }
    return value;
  };

  var fixLayoutData = function( data ) {
    for( var key in data ) {
      if( Array.isArray( data[key] ) ) {
        for( var i = 0; i < data[key].length; i++ ) {
          data[key][i] = translateWidgetToId( data[key][i] );
        }
      } else {
        data[key] = translateWidgetToId( data[key] );
      }
    }
    return data;
  };

  var fixProperties = function( properties ) {
    for( var key in properties ) {
      if( key === 'layoutData' ) {
        properties[key] = fixLayoutData( properties[key] );
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

  var pages = [];

  var setActivePage = function( page ) {
    pages.push( page );
    Tabris._UI.set( "activePage", page.id );
  };

  var getActivePage = function() {
    return pages[ pages.length - 1 ];
  };

  var setLastActivePage = function() {
    pages.pop();
    var page = getActivePage();
    Tabris._UI.set( "activePage", page.id );
  };

  var idSequence = 1;

  var generateId = function() {
    return "o" + ( idSequence++ );
  };

})();

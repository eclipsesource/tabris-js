/*global Tabris: true, ClientBridge: false */
(function() {

  Tabris = {

    create : function( type, properties ) {
      var id = generateId();
      ClientBridge._processCreate( id, fixType( type ), fixProperties( properties ) );
      return new WidgetProxy( id );
    },

    createPage : function( title, toplevel ) {
      if( !Tabris._isInitialized ) {
        Tabris._initialize();
      }
      var composite = Tabris.create( "rwt.widgets.Composite", {
        parent: Tabris._shell.id,
        layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
      });
      var page = Tabris.create( "tabris.Page", {
        parent: Tabris._UI.id,
        control: composite.id,
        title: title,
        topLevel: toplevel
      });
      composite.open = function() {
        setActivePage( page );
      };
      composite.close = function() {
        composite.destroy();
        setLastActivePage();
        page.destroy();
      };
      return composite;
    },

    _initialize : function() {
      Tabris._isInitialized = true;
      ClientBridge._processHead( "tabris.UI", true );
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
        // TODO close current page (back-button-support)
      });
    },

    _proxies: {}

  };

  var WidgetProxy = function( id ) {
    this.id = id;
    Tabris._proxies[id] = this;
  };

  WidgetProxy.prototype = {

    get: function( method ) {
      return ClientBridge._processGet( this.id, method );
    },

    set: function( arg1, arg2 ) {
      var properties;
      if( typeof arg1 === "string" ) {
        properties = {};
        properties[arg1] = arg2;
      } else {
        properties = arg1;
      }
      ClientBridge._processSet( this.id, fixProperties( properties ) );
      return this;
    },

    call: function( method, parameters ) {
      ClientBridge._processCall( this.id, method, parameters );
      return this;
    },

    on: function( event, listener /*, options*/ ) {
      ClientBridge._processListen( this.id, event, true, listener );
      return this;
    },

    destroy: function() {
      ClientBridge._processDestroy( this.id );
      delete Tabris._proxies[this.id];
    },

    append: function( type, properties ) {
      return Tabris.create( type, merge( properties, { parent: this.id } ) );
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

  var setLastActivePage = function() {
    pages.pop();
    var page = pages[ pages.length - 1 ];
    Tabris._UI.set( "activePage", page.id );
  };

  var idSequence = 1;

  var generateId = function() {
    return "o" + ( idSequence++ );
  };

  var merge = function( o1, o2 ) {
    var result = {};
    var name;
    for( name in o1 ) {
      result[name] = o1[name];
    }
    for( name in o2 ) {
      result[name] = o2[name];
    }
    return result;
  };

})();

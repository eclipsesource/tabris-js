/*global Tabris: true, ClientBridge: false */
(function() {

  Tabris = {

    create : function create( type, properties ) {
      if( !Tabris._isInitialized ) {
        Tabris._initialize();
      }
      var id = generateId();
      var result = new WidgetProxy( id );
      if( type === "tabris.Page" ) {
        var composite = Tabris.create( "rwt.widgets.Composite", {
          style: ["NONE"],
          parent: Tabris._shell.id,
          layoutData: { left: 0, right: 0, top: 0, bottom: 0 }
        });
        result.parent = composite;
        properties = merge( properties, {
          parent: Tabris.UI.id,
          control: composite.id
        });
      }
      ClientBridge._processCreate( id, type, fixCreateProperties( type, properties ) );
      return result;
    },

    _initialize : function() {
      Tabris._isInitialized = true;
      ClientBridge._processHead( "tabris.UI", true );
      Tabris.create( "rwt.widgets.Display" );
      Tabris._shell = Tabris.create( "rwt.widgets.Shell", {
        style: ["NO_TRIM"],
        mode: "maximized"
      });
      Tabris.UI = Tabris.create( "tabris.UI", {
        shell: Tabris._shell.id
      });
      Tabris.UI.on( "ShowPage", function( properties ) {
        var page = proxies[ properties.pageId ];
        Tabris.UI.set( "activePage", page.id );
      });
    }

  };

  var proxies = {};

  var WidgetProxy = function( id ) {
    this.id = id;
    proxies[id] = this;
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
      ClientBridge._processSet( this.id, properties );
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
      delete proxies[this.id];
    },

    append: function( type, properties ) {
      return Tabris.create( type, merge( properties, { parent: this.id } ) );
    }

  };

  var fixCreateProperties = function( type, properties ) {
    // TODO: these properties should become the default
    if( type === "rwt.widgets.Shell" ) {
      return merge({
        active: true,
        visibility: true
      }, properties );
    }
    return properties;
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

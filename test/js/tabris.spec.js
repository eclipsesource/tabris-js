/*global Tabris: false, ClientBridge: true */

describe( "Tabris", function() {

  var createClientBridgeSpy = function() {
    ClientBridge = jasmine.createSpyObj( 'ClientBridge',
                                        ['_processHead', '_processCreate', '_processSet',
                                         '_processCall', '_processListen', '_processDestroy'] );
  };

  beforeEach( function() {
    createClientBridgeSpy();
    Tabris._initialize();
    Tabris._isInitialized = true;
    createClientBridgeSpy();
  });

  describe( "initialize", function() {

    it( "creates Display, Shell, and Tabris UI", function() {
      Tabris._initialize();

      var createCalls = ClientBridge._processCreate.calls;
      expect( createCalls[0].args[1] ).toBe( "rwt.widgets.Display" );
      expect( createCalls[1].args[1] ).toBe( "rwt.widgets.Shell" );
      expect( createCalls[2].args[1] ).toBe( "tabris.UI" );
    });

    it( "created Shell is active, visible, and maximized", function() {
      Tabris._initialize();

      var shellProperties = ClientBridge._processCreate.calls[1].args[2];
      expect( shellProperties.active ).toBe( true );
      expect( shellProperties.visibility ).toBe( true );
      expect( shellProperties.mode ).toBe( 'maximized' );
    });

    it( "Tabris UI refers to Shell", function() {
      Tabris._initialize();

      var shellId = ClientBridge._processCreate.calls[1].args[0];
      var tabrisUIProperties = ClientBridge._processCreate.calls[2].args[2];
      expect( tabrisUIProperties.shell ).toBe( shellId );
    });

  });

  describe( "create", function() {

    it( "issues a create operation with type and properties", function() {
      Tabris.create( "foo.bar", { "foo": 23 } );

      expect( ClientBridge._processCreate ).toHaveBeenCalled();
      var type = ClientBridge._processCreate.calls[0].args[1];
      var properties = ClientBridge._processCreate.calls[0].args[2];
      expect( type ).toBe( "foo.bar" );
      expect( properties ).toEqual( { "foo" : 23 } );
    } );

    it( "creates a non-empty widget id", function() {
      Tabris.create( "type", { "foo": 23 } );

      var id = ClientBridge._processCreate.calls[0].args[0];
      expect( typeof id ).toBe( "string" );
      expect( id.length ).toBeGreaterThan( 0 );
    } );

    it( "creates different widget ids for subsequent calls", function() {
      Tabris.create( "type", { "foo": 23 } );
      Tabris.create( "type", { "foo": 23 } );

      var id1 = ClientBridge._processCreate.calls[0].args[0];
      var id2 = ClientBridge._processCreate.calls[1].args[0];
      expect( id2 ).not.toEqual( id1 );
    } );

    it( "returns a proxy object", function() {
      var result = Tabris.create( "type", { "foo": 23 } );
      expect( result ).toBeDefined();
      expect( typeof result.set ).toBe( "function" );
    } );

  } );

  describe( "createPage", function() {

    var getCompositeId = function() {
      return ClientBridge._processCreate.calls[0].args[0];
    };

    var getPageId = function() {
      return ClientBridge._processCreate.calls[1].args[0];
    };

    var getCompositeProperties = function() {
      return ClientBridge._processCreate.calls[0].args[2];
    };

    var getPageProperties = function() {
      return ClientBridge._processCreate.calls[1].args[2];
    };

    it( "creates a Composite and a Page", function() {
      Tabris.createPage( "title", true );

      expect( ClientBridge._processCreate ).toHaveBeenCalled();
      expect( ClientBridge._processCreate.calls[0].args[1] ).toBe( "rwt.widgets.Composite" );
      expect( ClientBridge._processCreate.calls[1].args[1] ).toBe( "tabris.Page" );
    } );

    it( "executes initialization if not yet initialized", function() {
      Tabris._isInitialized = undefined;
      Tabris.createPage( "type", { "foo": 23 } );

      expect( ClientBridge._processCreate ).toHaveBeenCalled();
      expect( ClientBridge._processCreate.calls[0].args[1] ).toBe( "rwt.widgets.Display" );
    } );

    describe( "created Composite", function() {

      it( "is full-size", function() {
        Tabris.createPage( "title", true );

        expect( getCompositeProperties().layoutData ).toEqual( { left: 0, right: 0, top: 0, bottom: 0 } );
      } );

      it( "Created Composite's parent is shell", function() {
        Tabris.createPage( "title", true );

        expect( getCompositeProperties().parent ).toEqual( Tabris._shell.id );
      } );

    } );

    describe( "created Page", function() {

      it( "has title and toplevel flag", function() {
        Tabris.createPage( "title", true );

        expect( getPageProperties().title ).toBe( "title" );
        expect( getPageProperties().topLevel ).toBe( true );
      } );

      it( "control is set to composite", function() {
        Tabris.createPage( "title", true );

        expect( getPageProperties().control ).toBe( getCompositeId() );
      } );

      it( "parent is set to Tabris.UI", function() {
        Tabris.createPage( "title", true );

        expect( getPageProperties().parent ).toBe( Tabris._UI.id );
      } );

    } );

    describe( "returned object", function() {

      it( "modifies composite", function() {
        var page = Tabris.createPage( "title", true );

        page.set( "background", "red" );

        expect( ClientBridge._processSet ).toHaveBeenCalled();
        expect( ClientBridge._processSet.calls[0].args[1].background ).toEqual( "red" );
      } );

      it( "supports open and close", function() {
        var page = Tabris.createPage( "title", true );

        expect( typeof page.open ).toBe( 'function' );
        expect( typeof page.close ).toBe( 'function' );
        page.open();
      } );

      it( "open sets active page", function() {
        var page = Tabris.createPage( "title", true );

        page.open();

        expect( ClientBridge._processSet ).toHaveBeenCalled();
        expect( ClientBridge._processSet.calls[0].args[0] ).toBe( Tabris._UI.id );
        expect( ClientBridge._processSet.calls[0].args[1].activePage ).toBe( getPageId() );
      } );

    } );

  } );

  describe( "call", function() {

    it( "issues call operation", function() {
      var proxy = Tabris.create( "type", { "foo": 23 } );
      proxy.call( "method", { "foo": 23 } );

      expect( ClientBridge._processCall ).toHaveBeenCalled();
    } );

  } );

} );

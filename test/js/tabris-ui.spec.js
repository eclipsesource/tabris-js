/*global Tabris: false, NativeBridgeSpy: false */

describe( "UIController", function() {

  var nativeBridge;
  var uiController;
  var uiId;
  var shellId;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    Tabris._loadFunctions = [];
    Tabris._start( nativeBridge );
    uiController = new Tabris.UIController();
  });

  describe( "initialize", function() {

    beforeEach( function() {
      uiController.init();
    });

    it( "creates Display, Shell, and Tabris UI", function() {
      var createCalls = nativeBridge.calls({ op: 'create' });
      expect( createCalls[0].type ).toBe( "rwt.widgets.Display" );
      expect( createCalls[1].type ).toBe( "rwt.widgets.Shell" );
      expect( createCalls[2].type ).toBe( "tabris.UI" );
    });

    it( "created Shell is active, visible, and maximized", function() {
      var shellCreate = nativeBridge.calls({ op: 'create', type: 'rwt.widgets.Shell' })[0];
      expect( shellCreate.properties.active ).toBe( true );
      expect( shellCreate.properties.visibility ).toBe( true );
      expect( shellCreate.properties.mode ).toBe( 'maximized' );
    });

    it( "created Tabris UI refers to Shell", function() {
      var shellCreate = nativeBridge.calls({ op: 'create', type: 'rwt.widgets.Shell' })[0];
      var tabrisUiCreate = nativeBridge.calls({ op: 'create', type: 'tabris.UI' })[0];
      expect( tabrisUiCreate.properties.shell ).toBe( shellCreate.id );
    });

    it( "listens on Tabris UI ShowPage and ShowPreviousPage events", function() {
      var tabrisUiId = nativeBridge.calls({ op: 'create', type: 'tabris.UI' })[0].id;
      expect( nativeBridge.calls({ op: 'listen', id: tabrisUiId, event: 'ShowPage' }).length ).toBe( 1 );
      expect( nativeBridge.calls({ op: 'listen', id: tabrisUiId, event: 'ShowPreviousPage' }).length ).toBe( 1 );
    });

  });

  describe( "install", function() {

    var target;

    beforeEach( function() {
      target = {};
      spyOn( uiController, "createPage" );
      spyOn( uiController, "createAction" );
      uiController.install( target );
    });

    it( "adds createPage function to target object", function() {
      target.createPage();

      expect( uiController.createPage ).toHaveBeenCalled();
      expect( uiController.createPage.calls.first().object ).toBe( uiController );
    });

    it( "adds createAction function to target object", function() {
      target.createAction();

      expect( uiController.createAction ).toHaveBeenCalled();
      expect( uiController.createAction.calls.first().object ).toBe( uiController );
    });

  });

  describe( "when initialized", function() {

    beforeEach(function() {
      uiController.init();
      shellId = nativeBridge.calls({ op: "create", type: "rwt.widgets.Shell" })[0].id;
      uiId = nativeBridge.calls({ op: "create", type: "tabris.UI" })[0].id;
      nativeBridge.resetCalls();
    });

    describe( "createAction", function() {

      var handler;
      var actionCreateCalls;

      beforeEach(function() {
        handler = jasmine.createSpy();
        uiController.createAction( { title: "Foo", enabled: true }, handler );
        actionCreateCalls = nativeBridge.calls({ op: 'create', type: 'tabris.Action' });
      });

      it( "creates an action", function() {
        expect( actionCreateCalls.length ).toBe( 1 );
      });

      it( "created action's parent is set to Tabris.UI", function() {
        expect( actionCreateCalls[0].properties.parent ).toEqual( uiId );
      });

      it( "properties are passed to created action", function() {
        expect( actionCreateCalls[0].properties.title ).toEqual( "Foo" );
        expect( actionCreateCalls[0].properties.enabled ).toBe( true );
      });

      it( "listens on created action", function() {
        var actionId = actionCreateCalls[0].id;

        expect( nativeBridge.calls({ op: 'listen', id: actionId, listen: true }).length ).toBe( 1 );
      });

      it( "handler is notified on action event", function() {
        var actionId = actionCreateCalls[0].id;

        Tabris._notify( actionId, "Selection", { "foo": 23 } );

        expect( handler ).toHaveBeenCalledWith( { "foo": 23 } );
      });

    });

    describe( "createPage", function() {

      it( "creates a Page and a Composite", function() {
        uiController.createPage();

        var createCalls = nativeBridge.calls({ op: "create" });
        expect( createCalls.select({ type: "tabris.Page" }).length ).toBe( 1 );
        expect( createCalls.select({ type: "rwt.widgets.Composite" }).length ).toBe( 1 );
      });

      it( "passes page properties to created Page", function() {
        uiController.createPage({ title: "foo" });

        var createCall = nativeBridge.calls({ op: "create", type: "tabris.Page" })[0];
        expect( createCall.properties.title ).toBe( "foo" );
      });

      it( "passes non-page properties to created Composite", function() {
        uiController.createPage({ background: "red" });

        var createCall = nativeBridge.calls({ op: "create", type: "rwt.widgets.Composite" })[0];
        expect( createCall.properties.background ).toBe( "red" );
      });

      it( "returns a PageProxy", function() {
        var page = uiController.createPage();

        expect( page instanceof Tabris.PageProxy ).toBe( true );
      });

    });

  });

});

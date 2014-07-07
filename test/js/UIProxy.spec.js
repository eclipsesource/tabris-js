/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: false, NativeBridgeSpy: false */

describe( "UIProxy", function() {

  var nativeBridge;
  var uiProxy;
  var uiId;
  var shellId;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    Tabris._loadFunctions = [];
    Tabris._start( nativeBridge );
    uiProxy = new Tabris.UIProxy();
  });

  describe( "create", function() {

    beforeEach( function() {
      uiProxy._create();
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
      spyOn( uiProxy, "createPage" );
      spyOn( uiProxy, "createAction" );
      uiProxy._install( target );
    });

    it( "adds createPage function to target object", function() {
      target.createPage();

      expect( uiProxy.createPage ).toHaveBeenCalled();
      expect( uiProxy.createPage.calls.first().object ).toBe( uiProxy );
    });

    it( "adds createAction function to target object", function() {
      target.createAction();

      expect( uiProxy.createAction ).toHaveBeenCalled();
      expect( uiProxy.createAction.calls.first().object ).toBe( uiProxy );
    });

  });

  describe( "after creation", function() {

    beforeEach(function() {
      uiProxy._create();
      shellId = nativeBridge.calls({ op: "create", type: "rwt.widgets.Shell" })[0].id;
      uiId = nativeBridge.calls({ op: "create", type: "tabris.UI" })[0].id;
      nativeBridge.resetCalls();
    });

    describe( "createAction", function() {

      var handler;
      var actionCreateCalls;

      beforeEach(function() {
        handler = jasmine.createSpy();
        uiProxy.createAction( { title: "Foo", enabled: true }, handler );
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
        uiProxy.createPage();

        var createCalls = nativeBridge.calls({ op: "create" });
        expect( createCalls.select({ type: "tabris.Page" }).length ).toBe( 1 );
        expect( createCalls.select({ type: "rwt.widgets.Composite" }).length ).toBe( 1 );
      });

      it( "passes page properties to created Page", function() {
        uiProxy.createPage({ title: "foo" });

        var createCall = nativeBridge.calls({ op: "create", type: "tabris.Page" })[0];
        expect( createCall.properties.title ).toBe( "foo" );
      });

      it( "passes non-page properties to created Composite", function() {
        uiProxy.createPage({ background: "red" });

        var createCall = nativeBridge.calls({ op: "create", type: "rwt.widgets.Composite" })[0];
        expect( createCall.properties.background ).toBe( "red" );
      });

      it( "returns a PageProxy", function() {
        var page = uiProxy.createPage();

        expect( page instanceof Tabris.PageProxy ).toBe( true );
      });

    });

  });

});

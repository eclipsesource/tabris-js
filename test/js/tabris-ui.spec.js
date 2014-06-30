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

      var getCompositeCreate = function() {
        return nativeBridge.calls({ op: 'create', type: 'rwt.widgets.Composite' })[0];
      };
      var getPageCreate = function() {
        return nativeBridge.calls({ op: 'create', type: 'tabris.Page' })[0];
      };

      it( "creates a Composite and a Page", function() {
        uiController.createPage();

        var createCalls = nativeBridge.calls({ op: 'create' });
        expect( createCalls.length ).toBe( 2 );
        expect( createCalls[0].type ).toBe( "rwt.widgets.Composite" );
        expect( createCalls[1].type ).toBe( "tabris.Page" );
      });

      describe( "created Composite", function() {

        var createCall;

        beforeEach(function() {
          uiController.createPage({ title: "title", image: "image", topLevel: true, background: "red" });
          createCall = nativeBridge.calls({ op: 'create', type: 'rwt.widgets.Composite' })[0];
        });

        it( "does not inherit page properties", function() {
          expect( createCall.properties.title ).not.toBeDefined();
          expect( createCall.properties.image ).not.toBeDefined();
          expect( createCall.properties.topLevel ).not.toBeDefined();
        });

        it( "has non-page properties", function() {
          expect( createCall.properties.background ).toEqual( "red" );
        });

        it( "is full-size", function() {
          expect( createCall.properties.layoutData ).toEqual( { left: 0, right: 0, top: 0, bottom: 0 } );
        });

        it( "parent is shell", function() {
          expect( createCall.properties.parent ).toEqual( shellId );
        });

      });

      describe( "created Page", function() {

        var createCall;

        beforeEach(function() {
          uiController.createPage({ title: "title", image: "image", topLevel: true, background: "red" });
          createCall = nativeBridge.calls({ op: 'create', type: 'tabris.Page' })[0];
        });

        it( "does not inherit non-page properties", function() {
          expect( createCall.properties.background ).not.toBeDefined();
        });

        it( "has title, image and topLevel properties", function() {
          expect( createCall.properties.title ).toBe( "title" );
          expect( createCall.properties.image ).toBe( "image" );
          expect( createCall.properties.topLevel ).toBe( true );
        });

        it( "control is set to composite", function() {
          expect( createCall.properties.control ).toBe( getCompositeCreate().id );
        });

        it( "parent is set to Tabris.UI", function() {
          expect( createCall.properties.parent ).toBe( uiId );
        });

      });

      describe( "returned object", function() {

        it( "modifies composite", function() {
          var page = uiController.createPage();

          page.set( "background", "red" );

          var setCalls = nativeBridge.calls({ op: 'set' });
          expect( setCalls.length ).toBeGreaterThan( 0 );
          expect( setCalls[0].properties.background ).toEqual( "red" );
        });

        it( "supports open and close", function() {
          var page = uiController.createPage();

          expect( typeof page.open ).toBe( 'function' );
          expect( typeof page.close ).toBe( 'function' );
          page.open();
        });

        describe( "open", function() {

          it( "sets active page", function() {
            var page = uiController.createPage();

            page.open();

            var call = nativeBridge.calls({ op: 'set', id: uiId  })[0];
            expect( call.properties.activePage ).toBe( getPageCreate().id );
          });

        });

        describe( "close", function() {

          it( "resets previous active page", function() {
            var page1 = uiController.createPage();
            var page2 = uiController.createPage();
            page1.open();
            var page1Id = getPageCreate().id;
            page2.open();
            nativeBridge.resetCalls();

            page2.close();

            var call = nativeBridge.calls({ op: 'set', id: uiId  })[0];
            expect( call.properties.activePage ).toBe( page1Id ); // TODO add _pageId field in page
          });

          it( "destroys composite and page", function() {
            var page = uiController.createPage();
            page.open();

            page.close();

            expect( nativeBridge.calls({ op: 'destroy', id: getPageCreate().id }).length ).toBe( 1 );
            expect( nativeBridge.calls({ op: 'destroy', id: getCompositeCreate().id }).length ).toBe( 1 );
          });

        });

      });

    });

  });

});

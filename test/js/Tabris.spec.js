/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global tabris: false, NativeBridgeSpy: false */

describe( "tabris", function() {

  var nativeBridge;
  var log;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    tabris._loadFunctions = [];
    tabris._start( nativeBridge );
  });

  describe( "_start", function() {

    it( "can be called without a context", function() {
      tabris._start.call( null, nativeBridge );
    });

    it( "executes all load functions", function() {
      tabris.load( function() {
        log.push( "foo" );
      });
      tabris.load( function() {
        log.push( "bar" );
      });

      tabris._start.call( null );

      expect( log ).toEqual( ["foo", "bar"] );
    });

    it( "load functions can access tabris functions", function() {
      tabris.load( function() {
        tabris.create( "Foo" );
      });

      tabris._start.call( null, nativeBridge );

      expect( nativeBridge.calls({ op: "create", type: "rwt.widgets.Foo" }).length ).toBe( 1 );
    });

  });

  describe( "_notify", function() {

    it( "notifies widget proxy", function() {
      var label = tabris.create( "Label", {} );
      spyOn( label, "_notifyListeners" );

      tabris._notify( label.id, "foo", { "bar": 23 } );

      expect( label._notifyListeners ).toHaveBeenCalledWith( "foo", [{ "bar": 23 }] );
    });

    it( "sliently ignores events for non-existing ids (does not crash)", function() {
      tabris._notify( "no-id", "foo", [23, 42] );
    });

    it( "can be called without a context", function() {
      tabris._notify.call( "no-id", "foo", [23, 42] );
    });

  });

  describe( "load", function() {

    it( "function is executed at start time", function() {
      var fn = jasmine.createSpy();

      tabris.load( fn );
      tabris._start( nativeBridge );

      expect( fn ).toHaveBeenCalled();
    });

    it( "nested load functions are executed at the end", function() {
      var log = [];

      tabris.load( function() {
        log.push( "1" );
        tabris.load( function() {
          log.push( "1a" );
        });
        tabris.load( function() {
          log.push( "1b" );
        });
      });
      tabris.load( function() {
        log.push( "2" );
      });
      tabris._start( nativeBridge );

      expect( log ).toEqual([ "1", "2", "1a", "1b" ]);
    });

  });

  describe( "create", function() {

    it( "fails if tabris.js not yet started", function() {
      delete tabris._nativeBridge;

      expect( function() {
        tabris.create( "foo.bar", {} );
      } ).toThrowError( "tabris.js not started" );
    } );

    it( "creates a non-empty widget id", function() {
      var proxy = tabris.create( "type", {} );

      expect( typeof proxy.id ).toBe( "string" );
      expect( proxy.id.length ).toBeGreaterThan( 0 );
    } );

    it( "creates different widget ids for subsequent calls", function() {
      var proxy1 = tabris.create( "type", {} );
      var proxy2 = tabris.create( "type", {} );

      expect( proxy1.id ).not.toEqual( proxy2.id );
    } );

    it( "returns a proxy object", function() {
      var result = tabris.create( "type", {} );

      expect( result ).toEqual( jasmine.any( tabris.Proxy ) );
    } );

    it( "triggers a create operation with type and properties", function() {
      var proxy = tabris.create( "foo.bar", { foo: 23 } );

      var createCall = nativeBridge.calls({ op: "create", id: proxy.id })[0];

      expect( createCall.type ).toBe( "foo.bar" );
      expect( createCall.properties.foo ).toBe( 23 );
    } );

  } );

} );

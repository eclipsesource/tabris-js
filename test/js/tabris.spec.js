/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: false, NativeBridgeSpy: false */

describe( "Tabris", function() {

  var nativeBridge;
  var log;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    Tabris._loadFunctions = [];
    Tabris._start( nativeBridge );
  });

  describe( "_start", function() {

    it( "can be called without a context", function() {
      Tabris._start.call( null, nativeBridge );
    });

    it( "executes all load functions", function() {
      Tabris.load( function() {
        log.push( "foo" );
      });
      Tabris.load( function() {
        log.push( "bar" );
      });

      Tabris._start.call( null );

      expect( log ).toEqual( ["foo", "bar"] );
    });

    it( "load functions can access Tabris functions", function() {
      Tabris.load( function() {
        Tabris.create( "Foo" );
      });

      Tabris._start.call( null, nativeBridge );

      expect( nativeBridge.calls({ op: "create", type: "rwt.widgets.Foo" }).length ).toBe( 1 );
    });

  });

  describe( "_notify", function() {

    it( "notifies widget proxy", function() {
      var label = Tabris.create( "Label", {} );
      spyOn( label, "_notifyListeners" );

      Tabris._notify( label.id, "foo", { "bar": 23 } );

      expect( label._notifyListeners ).toHaveBeenCalledWith( "foo", [{ "bar": 23 }] );
    });

    it( "sliently ignores events for non-existing ids (does not crash)", function() {
      Tabris._notify( "no-id", "foo", [23, 42] );
    });

    it( "can be called without a context", function() {
      Tabris._notify.call( "no-id", "foo", [23, 42] );
    });

  });

  describe( "load", function() {

    it( "function is executed at start time", function() {
      var fn = jasmine.createSpy();

      Tabris.load( fn );
      Tabris._start( nativeBridge );

      expect( fn ).toHaveBeenCalled();
    });

    it( "nested load functions are executed at the end", function() {
      var log = [];

      Tabris.load( function() {
        log.push( "1" );
        Tabris.load( function() {
          log.push( "1a" );
        });
        Tabris.load( function() {
          log.push( "1b" );
        });
      });
      Tabris.load( function() {
        log.push( "2" );
      });
      Tabris._start( nativeBridge );

      expect( log ).toEqual([ "1", "2", "1a", "1b" ]);
    });

  });

  describe( "create", function() {

    it( "fails if tabris.js not yet started", function() {
      delete Tabris._nativeBridge;

      expect( function() {
        Tabris.create( "foo.bar", {} );
      } ).toThrowError( "tabris.js not started" );
    } );

    it( "creates a non-empty widget id", function() {
      var proxy = Tabris.create( "type", {} );

      expect( typeof proxy.id ).toBe( "string" );
      expect( proxy.id.length ).toBeGreaterThan( 0 );
    } );

    it( "creates different widget ids for subsequent calls", function() {
      var proxy1 = Tabris.create( "type", {} );
      var proxy2 = Tabris.create( "type", {} );

      expect( proxy1.id ).not.toEqual( proxy2.id );
    } );

    it( "returns a proxy object", function() {
      var result = Tabris.create( "type", {} );

      expect( result ).toEqual( jasmine.any( Tabris.Proxy ) );
    } );

    it( "triggers a create operation with type and properties", function() {
      var proxy = Tabris.create( "foo.bar", { foo: 23 } );

      var createCall = nativeBridge.calls({ op: "create", id: proxy.id })[0];

      expect( createCall.type ).toBe( "foo.bar" );
      expect( createCall.properties.foo ).toBe( 23 );
    } );

  } );

} );

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
        Tabris.create( "foo.bar", { foo: 23 } );
      } ).toThrowError( "tabris.js not started" );
    } );

    it( "calls native create with type and properties", function() {
      Tabris.create( "foo.bar", { foo: 23 } );

      var calls = nativeBridge.calls({ op: 'create', type: 'foo.bar' });
      expect( calls.length ).toBe( 1 );
      expect( calls[0].properties ).toEqual( { foo: 23 } );
    } );

    it( "creates a non-empty widget id", function() {
      Tabris.create( "type", { foo: 23 } );

      var id = nativeBridge.calls()[0].id;
      expect( typeof id ).toBe( "string" );
      expect( id.length ).toBeGreaterThan( 0 );
    } );

    it( "creates different widget ids for subsequent calls", function() {
      Tabris.create( "type", { foo: 23 } );
      Tabris.create( "type", { foo: 23 } );

      var createCalls = nativeBridge.calls({ op: 'create' });
      expect( createCalls[0].id ).not.toEqual( createCalls[1].id );
    } );

    it( "translates parent widget to id in properties", function() {
      var parent = Tabris.create( "Composite", {} );

      Tabris.create( "Label", { parent: parent } );

      var properties = nativeBridge.calls({ op: 'create', type: "rwt.widgets.Label" })[0].properties;
      expect( properties.parent ).toEqual( parent.id );
    } );

    it( "translates widgets to ids in layoutData", function() {
      var label = Tabris.create( "Label", {} );

      Tabris.create( "custom.type", { layoutData: { left: 23, right: label, top: [label, 42] } } );

      var properties = nativeBridge.calls({ op: 'create', type: "custom.type" })[0].properties;
      expect( properties.layoutData ).toEqual( { left: 23, right: label.id, top: [label.id, 42] } );
    } );

    it( "accepts rwt types without prefix", function() {
      Tabris.create( "Label", {} );

      expect( nativeBridge.calls({ op: 'create' })[0].type ).toEqual( "rwt.widgets.Label" );
    } );

    it( "accepts prefixed types", function() {
      Tabris.create( "custom.Label", {} );

      expect( nativeBridge.calls({ op: 'create' })[0].type ).toEqual( "custom.Label" );
    } );

    it( "returns a proxy object", function() {
      var result = Tabris.create( "type", { foo: 23 } );

      expect( result ).toBeDefined();
      expect( typeof result.set ).toBe( "function" );
    } );

  } );

  describe( "append", function() {

    it( "calls native create with parent", function() {
      var parent = Tabris.create( "Composite", {} );

      parent.append( "Label", {} );

      var createCall = nativeBridge.calls({ op: "create", type: "rwt.widgets.Label" })[0];
      expect( createCall.properties.parent ).toBe( parent.id );
    } );

    it( "fails on disposed object", function() {
      var parent = Tabris.create( "Composite", {} );
      parent.dispose();

      expect( function() {
        parent.append( "Label", {} );
      }).toThrowError( "Object is disposed" );
    } );

    it( "returns a proxy object with parent", function() {
      var parent = Tabris.create( "Composite", {} );

      var child = parent.append( "Label", {} );

      expect( child ).toBeDefined();
      expect( typeof child.set ).toBe( "function" );
      expect( child._parent ).toBe( parent );
    } );

  } );

  describe( "get", function() {

    it( "calls native get", function() {
      var label = Tabris.create( "Label", {} );

      label.get( "foo" );

      expect( nativeBridge.calls({ op: "get", property: "foo" }).length ).toBe( 1 );
    } );

    it( "returns value from native", function() {
      var label = Tabris.create( "Label", {} );
      spyOn( nativeBridge, "get" ).and.returnValue( 23 );

      var result = label.get( "prop" );

      expect( result ).toBe( 23 );
    } );

    it( "fails on disposed object", function() {
      var label = Tabris.create( "Label", {} );
      label.dispose();

      expect( function() {
        label.get( "foo" );
      }).toThrowError( "Object is disposed" );
    } );

  } );

  describe( "set", function() {

    it( "translates widgets to ids in layoutData", function() {
      var label = Tabris.create( "Label", {} );
      label.set( "layoutData", { left: 23, right: label, top: [label, 42] } );

      var call = nativeBridge.calls({ op: 'set' })[0];
      expect( call.properties.layoutData ).toEqual( { left: 23, right: label.id, top: [label.id, 42] } );
    } );

    it( "returns self to allow chaining", function() {
      var label = Tabris.create( "Label", {} );

      var result = label.set( "foo", 23 );

      expect( result ).toBe( label );
    } );

    it( "fails on disposed object", function() {
      var label = Tabris.create( "Label", {} );
      label.dispose();

      expect( function() {
        label.set( "foo", 23 );
      }).toThrowError( "Object is disposed" );
    } );

  } );

  describe( "call", function() {

    it( "calls native call", function() {
      var label = Tabris.create( "type", { foo: 23 } );
      label.call( "method", { foo: 23 } );

      var call = nativeBridge.calls()[1];
      expect( call.op ).toEqual( 'call' );
      expect( call.method ).toEqual( 'method' );
      expect( call.parameters ).toEqual( { foo: 23 } );
    } );

    it( "returns self to allow chaining", function() {
      var label = Tabris.create( "Label", {} );

      var result = label.call( "foo", {} );

      expect( result ).toBe( label );
    } );

    it( "fails on disposed object", function() {
      var label = Tabris.create( "Label", {} );
      label.dispose();

      expect( function() {
        label.call( "foo", {} );
      }).toThrowError( "Object is disposed" );
    } );

  } );

  describe( "on", function() {

    var label;
    var listener;

    beforeEach( function() {
      label = Tabris.create( "Label", {} );
      listener = jasmine.createSpy( "listener" );
      nativeBridge.resetCalls();
    } );

    it( "calls native listen (true) for first listener", function() {
      label.on( "foo", listener );

      var call = nativeBridge.calls({ op: 'listen', event: 'foo' })[0];
      expect( call.listen ).toEqual( true );
    } );

    it( "calls native listen for another listener for another event", function() {
      label.on( "foo", listener );
      label.on( "bar", listener );

      var call = nativeBridge.calls({ op: 'listen', event: 'bar' })[0];
      expect( call.listen ).toEqual( true );
    } );

    it( "does not call native listen for subsequent listeners for the same event", function() {
      label.on( "foo", listener );
      label.on( "foo", listener );

      expect( nativeBridge.calls({ op: 'listen' }).length ).toBe( 1 );
    } );

    it( "returns self to allow chaining", function() {
      var result = label.on( "foo", listener );

      expect( result ).toBe( label );
    } );

    it( "fails on disposed object", function() {
      label.dispose();

      expect( function() {
        label.on( "foo", listener );
      }).toThrowError( "Object is disposed" );
    } );

  } );

  describe( "off", function() {

    var label;
    var listener;

    beforeEach( function() {
      label = Tabris.create( "Label", {} );
      listener = jasmine.createSpy( "listener" );
      label.on( "foo", listener );
      nativeBridge.resetCalls();
    } );

    it( "calls native listen (false) for last listener removed", function() {
      label.off( "foo", listener );

      var call = nativeBridge.calls({ op: 'listen', event: 'foo' })[0];
      expect( call.listen ).toBe( false );
    } );

    it( "calls native listen when there are other listeners for the same event", function() {
      label.on( "foo", listener );
      label.off( "foo", listener );

      expect( nativeBridge.calls().length ).toBe( 0 );
    } );

    it( "returns self to allow chaining", function() {
      var result = label.off( "foo", listener );

      expect( result ).toBe( label );
    } );

    it( "fails on disposed object", function() {
      label.dispose();

      expect( function() {
        label.off( "foo", listener );
      }).toThrowError( "Object is disposed" );
    } );

  } );

  describe( "dispose", function() {

    it( "calls native destroy", function() {
      var label = Tabris.create( "type", { foo: 23 } );

      label.dispose();

      var createCall = nativeBridge.calls({ op: 'create' })[0];
      var destroyCall = nativeBridge.calls({ op: 'destroy' })[0];
      expect( destroyCall.id ).toBe( createCall.id );
    } );

    it( "notifies dispose listeners", function() {
      var label = Tabris.create( "type", { foo: 23 } );
      var listener = jasmine.createSpy();
      label.on( "Dispose", listener );

      label.dispose();

      expect( listener ).toHaveBeenCalled();
    } );

    it( "notifies all children's dispose listeners", function() {
      var parent = Tabris.create( "type", {} );
      var child1 = Tabris.create( "type", { parent: parent } );
      var child2 = Tabris.create( "type", { parent: parent } );

      parent.on( "Dispose", function() { log.push( "parent" ); } );
      child1.on( "Dispose", function() { log.push( "child1" ); } );
      child2.on( "Dispose", function() { log.push( "child2" ); } );

      parent.dispose();

      expect( log ).toEqual( [ "child1", "child2", "parent" ] );
    } );

    it( "notifies children's dispose listeners recursively", function() {
      var parent = Tabris.create( "type", {} );
      var child = Tabris.create( "type", { parent: parent } );
      var grandchild = Tabris.create( "type", { parent: child } );
      parent.on( "Dispose", function() { log.push( "parent" ); } );
      child.on( "Dispose", function() { log.push( "child" ); } );
      grandchild.on( "Dispose", function() { log.push( "grandchild" ); } );

      parent.dispose();

      expect( log ).toEqual( [ "grandchild", "child", "parent" ] );
    } );

    it( "does not call native destroy on children", function() {
      var parent = Tabris.create( "type", {} );
      Tabris.create( "type", { parent: parent } );

      parent.dispose();

      expect( nativeBridge.calls({ op: 'destroy' }).length ).toBe( 1 );
    } );

    it( "does not call native destroy twice when called twice", function() {
      var label = Tabris.create( "type", {} );

      label.dispose();
      label.dispose();

      expect( nativeBridge.calls({ op: 'destroy' }).length ).toBe( 1 );
    } );

    it( "unregisters from parent to allow garbage collection", function() {
      var parent = Tabris.create( "Composite", {} );
      var child = Tabris.create( "Label", { parent: parent } );

      child.dispose();

      expect( parent._children.length ).toBe( 0 );
    } );

  } );

  describe( "listener management", function() {

    var label;
    var listener;

    beforeEach( function() {
      label = Tabris.create( "Label", {} );
      listener = jasmine.createSpy( "listener" );
    } );

    it( "notify without listeners does not fail", function() {
      label._notifyListeners( "foo", ["bar", 23] );
    } );

    it( "added listener will be notified", function() {
      label._addListener( "foo", listener );
      label._notifyListeners( "foo", ["bar", 23] );

      expect( listener ).toHaveBeenCalledWith( "bar", 23 );
    } );

    it( "listeners added twice will be notified twice", function() {
      label._addListener( "foo", listener );
      label._addListener( "foo", listener );
      label._notifyListeners( "foo", ["bar", 23] );

      expect( listener.calls.count() ).toBe( 2 );
    } );

    it( "removed listeners will not be notfied anymore", function() {
      label._addListener( "foo", listener );
      label._removeListener( "foo", listener );
      label._notifyListeners( "foo", [] );

      expect( listener ).not.toHaveBeenCalled();
    } );

  } );

} );

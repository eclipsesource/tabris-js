/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global Tabris: false, NativeBridgeSpy: false */

describe( "Proxy", function() {

  var nativeBridge;
  var log;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    log = [];
    Tabris._loadFunctions = [];
    Tabris._start( nativeBridge );
  });

  describe( "create", function() {

    var proxy;

    beforeEach( function() {
      proxy = new Tabris.Proxy( "id2" );
    });

    it( "calls native create with type and properties", function() {
      proxy._create( "foo.bar", { foo: 23 } );

      var calls = nativeBridge.calls({ op: "create", type: "foo.bar" });
      expect( calls.length ).toBe( 1 );
      expect( calls[0].properties ).toEqual( { foo: 23 } );
    } );

    it( "translates parent widget to id in properties", function() {
      var parent = new Tabris.Proxy( "parent-id" );

      proxy._create( "my.type", { parent: parent } );

      var properties = nativeBridge.calls({ op: "create", id: proxy.id })[0].properties;
      expect( properties.parent ).toEqual( "parent-id" );
    } );

    it( "translates widgets to ids in layoutData", function() {
      var label = new Tabris.Proxy( "label-id" );

      proxy._create( "custom.type", { layoutData: { left: 23, right: label, top: [label, 42] } } );

      var properties = nativeBridge.calls({ op: "create", type: "custom.type" })[0].properties;
      expect( properties.layoutData ).toEqual( { left: 23, right: label.id, top: ["label-id", 42] } );
    } );

    it( "accepts rwt types without prefix", function() {
      proxy._create( "Label", {} );

      expect( nativeBridge.calls({ op: "create" })[0].type ).toEqual( "rwt.widgets.Label" );
    } );

    it( "accepts prefixed types", function() {
      proxy._create( "custom.Label", {} );

      expect( nativeBridge.calls({ op: "create" })[0].type ).toEqual( "custom.Label" );
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

      expect( child ).toEqual( jasmine.any( Tabris.Proxy ) );
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

      var call = nativeBridge.calls({ op: "set" })[0];
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
      expect( call.op ).toEqual( "call" );
      expect( call.method ).toEqual( "method" );
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

      var call = nativeBridge.calls({ op: "listen", event: "foo" })[0];
      expect( call.listen ).toEqual( true );
    } );

    it( "calls native listen for another listener for another event", function() {
      label.on( "foo", listener );
      label.on( "bar", listener );

      var call = nativeBridge.calls({ op: "listen", event: "bar" })[0];
      expect( call.listen ).toEqual( true );
    } );

    it( "does not call native listen for subsequent listeners for the same event", function() {
      label.on( "foo", listener );
      label.on( "foo", listener );

      expect( nativeBridge.calls({ op: "listen" }).length ).toBe( 1 );
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

      var call = nativeBridge.calls({ op: "listen", event: "foo" })[0];
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

      var createCall = nativeBridge.calls({ op: "create" })[0];
      var destroyCall = nativeBridge.calls({ op: "destroy" })[0];
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

      expect( nativeBridge.calls({ op: "destroy" }).length ).toBe( 1 );
    } );

    it( "does not call native destroy twice when called twice", function() {
      var label = Tabris.create( "type", {} );

      label.dispose();
      label.dispose();

      expect( nativeBridge.calls({ op: "destroy" }).length ).toBe( 1 );
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

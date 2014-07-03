/*global NativeBridgeSpy: false */

describe( "NativeBridgeSpy", function() {

  var nativeBridge;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
  });

  describe( "calls are recorded", function() {

    it( "create", function() {
      var props = {};
      nativeBridge.create( "id", "type", props );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "create" );
      expect( call.id ).toBe( "id" );
      expect( call.type ).toBe( "type" );
      expect( call.properties ).toBe( props );
    });

    it( "get", function() {
      nativeBridge.get( "id", "prop" );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "get" );
      expect( call.id ).toBe( "id" );
      expect( call.property ).toBe( "prop" );
    });

    it( "set", function() {
      var props = {};
      nativeBridge.set( "id", props );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "set" );
      expect( call.id ).toBe( "id" );
      expect( call.properties ).toBe( props );
    });

    it( "call", function() {
      var params = {};
      nativeBridge.call( "id", "method", params );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "call" );
      expect( call.id ).toBe( "id" );
      expect( call.method ).toBe( "method" );
      expect( call.parameters ).toBe( params );
    });

    it( "listen", function() {
      nativeBridge.listen( "id", "event", true );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "listen" );
      expect( call.id ).toBe( "id" );
      expect( call.event ).toBe( "event" );
      expect( call.listen ).toBe( true );
    });

    it( "destroy", function() {
      nativeBridge.destroy( "id" );

      var call = nativeBridge.calls()[0];
      expect( call.op ).toBe( "destroy" );
      expect( call.id ).toBe( "id" );
    });

  });

  describe( "without any calls", function() {

    it( "result list is empty", function() {
      expect( nativeBridge.calls().length ).toBe( 0 );
    });

    it( "result list supports select", function() {
      expect( nativeBridge.calls().select().length ).toBe( 0 );
    });

  });

  describe( "when calls have been made", function() {

    beforeEach( function() {
      nativeBridge.create( "id1", "type1", { "foo": 1 } );
      nativeBridge.create( "id2", "type2", { "foo": 2 } );
      nativeBridge.set( "id1", { "bar": 1 } );
      nativeBridge.set( "id2", { "bar": 2 } );
    });

    it( "result list has contains all calls", function() {
      expect( nativeBridge.calls().length ).toBe( 4 );
    });

    it( "result list can be filtered", function() {
      expect( nativeBridge.calls({ id: "id1" }).length ).toBe( 2 );
    });

    it( "filtered result list supports select", function() {
      expect( nativeBridge.calls({ id: "id1" }).select({ op: "set" }).length ).toBe( 1 );
    });

  });

});

/*global Tabris: false, ClientBridge: true */

describe( "Tabris", function() {

  beforeEach( function() {
    ClientBridge = jasmine.createSpyObj( 'ClientBridge', ['_processCreate', '_processCall', '_processHead', '_processListen'] );
  } );

  describe( "create", function() {

    it( "issues a create operation with type and properties", function() {
      Tabris.create( "foo.bar", { "foo": 23 } );

      expect( ClientBridge._processCreate ).toHaveBeenCalled();
      var type = ClientBridge._processCreate.calls[3].args[1];
      var properties = ClientBridge._processCreate.calls[3].args[2];
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

  describe( "call", function() {

    it( "issues call operation", function() {
      var proxy = Tabris.create( "type", { "foo": 23 } );
      proxy.call( "method", { "foo": 23 } );

      expect( ClientBridge._processCall ).toHaveBeenCalled();
    } );

  } );

} );

/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe( "Console", function() {

  var console;
  var nativeBridge;

  beforeEach( function() {
    nativeBridge = new NativeBridgeSpy();
    console = new tabris.Console();
    tabris._reset();
    tabris._start( nativeBridge );
   });

  it( "log delegates to native bridge", function() {
    console.log( 23, "foo" );

    var call = nativeBridge.calls({ op: "call", id: "tabris.Console" })[0];
    expect( call.method ).toEqual( "log" );
    expect( call.parameters ).toEqual( { args: [23, "foo"] } );
  });

  it( "info delegates to native bridge", function() {
    console.info( 23, "foo" );

    var call = nativeBridge.calls({ op: "call", id: "tabris.Console" })[0];
    expect( call.method ).toEqual( "info" );
    expect( call.parameters ).toEqual( { args: [23, "foo"] } );
  });

  it( "warn delegates to native bridge", function() {
    console.warn( 23, "foo" );

    var call = nativeBridge.calls({ op: "call", id: "tabris.Console" })[0];
    expect( call.method ).toEqual( "warn" );
    expect( call.parameters ).toEqual( { args: [23, "foo"] } );
  });

  it( "warn delegates to native bridge", function() {
    console.error( 23, "foo" );

    var call = nativeBridge.calls({ op: "call", id: "tabris.Console" })[0];
    expect( call.method ).toEqual( "error" );
    expect( call.parameters ).toEqual( { args: [23, "foo"] } );
  });

});

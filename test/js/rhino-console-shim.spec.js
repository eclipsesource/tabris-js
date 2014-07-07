/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global java: true, console: false */

describe( "rhino-console-shim", function() {

  var log;

  beforeEach( function() {
    log = "";
    java = {};
    java.lang = {};
    java.lang.System = {};
    java.lang.System.out = {
      print: function( string ) {
        log += string;
      },
      println: function( string ) {
        log += (typeof string === "undefined" ? "" : string) + "\n";
      }
    };
  } );

  describe( "log", function() {

    it( "can print a string", function() {
      console.log( "foo" );
      expect( log ).toEqual( '"foo"\n' );
    } );

    it( "can print null", function() {
      console.log( null );
      expect( log ).toEqual( 'null\n' );
    } );

    it( "can print boolean values", function() {
      console.log( true, false );
      expect( log ).toEqual( 'true false\n' );
    } );

    it( "can print arrays", function() {
      console.log( [ "foo", 23 ] );
      expect( log ).toEqual( '["foo", 23]\n' );
    } );

    it( "can print nested arrays", function() {
      console.log( [ "foo", [ "bar", 23 ], 42 ] );
      expect( log ).toEqual( '["foo", ["bar", 23], 42]\n' );
    } );

    it( "can print objects", function() {
      console.log( { foo: 23, bar: true } );
      expect( log ).toEqual( '{foo: 23, bar: true}\n' );
    } );

    it( "can print function arguments", function() {
      console.log( arguments );
      expect( log ).toEqual( '[object Arguments]\n' );
    } );

    it( "accepts multiple arguments", function() {
      console.log( "foo", 23 );
      expect( log ).toEqual( '"foo" 23\n' );
    } );

  } );

} );

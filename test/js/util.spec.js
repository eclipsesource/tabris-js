/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe( "util", function() {

  describe( "extend", function() {

    it( "copies properties of all source objects into target object", function() {
      var target = { "a": 1, "b": 1 };

      util.extend( target, { "b": 2, "c": 2 }, { "c": 3 } );

      expect( target ).toEqual( { "a": 1, "b": 2, "c": 3 } );
    });

    it( "returns target object", function() {
      var object = {};

      var result = util.extend( object, { "a": 1 } );

      expect( result ).toBe( object );
    });

  });

  describe( "pick", function() {

    it( "returns a copy", function() {
      var original = { "a": 1 };

      var result = util.pick( original, ["a"] );

      expect( result ).not.toBe( original );
    });

    it( "copies all properties that are in the list", function() {
      var result = util.pick( { "a": 1, "b": 2, "c": 3 }, ["a", "c", "x"] );

      expect( result ).toEqual( { "a": 1, "c": 3 } );
    });

  });

  describe( "omit", function() {

    it( "returns a copy", function() {
      var original = { "a": 1 };

      var result = util.omit( original, ["b"] );

      expect( result ).not.toBe( original );
    });

    it( "copies all properties that are not in the list", function() {
      var result = util.omit( { "a": 1, "b": 2, "c": 3 }, ["a", "c", "x"] );

      expect( result ).toEqual( { "b": 2 } );
    });

  });

  describe( "bind", function() {

    it( "returns a wrapper that will be called with context", function() {
      var fn = function() { return this; };
      var obj = {};

      var wrapper = util.bind( fn, obj );

      expect( wrapper() ).toBe( obj );
    });

    it( "wrapper receives arguments", function() {
      var fn = jasmine.createSpy();

      var wrapper = util.bind( fn, {} );
      wrapper( 23, 42 );

      expect( fn ).toHaveBeenCalledWith( 23, 42 );
    });

  });

  describe( "extendPrototype", function() {

    it( "returns object with source function prototype as prototype", function() {
      var Class1 = function(){};
      Class1.prototype = { "a" : 1 };
      var object = util.extendPrototype( Class1, {} );

      expect( object.a ).toBe( 1 );
      expect( object.hasOwnProperty( "a" ) ).toBeFalsy();
    });

    it( "returns object with target object properties", function() {
      var object = util.extendPrototype( function(){}, { "a" : 1 } );

      expect( object.a ).toBe( 1 );
      expect( object.hasOwnProperty( "a" ) ).toBeTruthy();
    });

    it( "works with instanceof", function() {
      var Class1 = function(){};
      var Class2 = function(){};

      Class2.prototype = util.extendPrototype( Class1, {} );
      var object = new Class2();

      expect( object instanceof Class2 ).toBeTruthy();
      expect( object instanceof Class1 ).toBeTruthy();
    });

  });

});

/*global util: false */

describe( "util", function() {

  describe( "merge", function() {

    it( "returns a copy", function() {
      var original = { "a": 1 };

      var result = util.merge( original, { "b": 2 } );

      expect( result ).not.toBe( original );
    });

    it( "copies properties of all parameter objects", function() {
      var result = util.merge( { "a": 1, "b": 1 }, { "b": 2, "c": 2 }, { "c": 3 } );

      expect( result ).toEqual( { "a": 1, "b": 2, "c": 3 } );
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

});

/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

/*global console: true, java: false */

(function() {

var isObject = function( value ) {
  return Object.prototype.toString.call( value ) === '[object Object]';
};

var printArray = function( array ) {
  java.lang.System.out.print( "[" );
  for( var i = 0; i < array.length; i++ ) {
    if( i > 0 ) {
      java.lang.System.out.print( ", " );
    }
    print( array[i] );
  }
  java.lang.System.out.print( "]" );
};

var printObject = function( object ) {
  java.lang.System.out.print( "{" );
  var i = 0;
  for( var key in object ) {
    if( i > 0 ) {
      java.lang.System.out.print( ", " );
    }
    java.lang.System.out.print( key );
    java.lang.System.out.print( ": " );
    print( object[key] );
    i++;
  }
  java.lang.System.out.print( "}" );
};

var printString = function( string ) {
  java.lang.System.out.print( '"' );
  java.lang.System.out.print( string );
  java.lang.System.out.print( '"' );
};

var print = function( value ) {
  if( Array.isArray( value ) ) {
    printArray( value );
  } else if( isObject( value ) ) {
    printObject( value );
  } else if( typeof value === "string" ) {
    printString( value );
  } else {
    java.lang.System.out.print( value );
  }
};

console = {

  log: function() {
    for( var i = 0; i < arguments.length; i++ ) {
       if( i > 0 ) {
         java.lang.System.out.print( " " );
       }
       print( arguments[i] );
    }
    java.lang.System.out.println();
  }

};

})();

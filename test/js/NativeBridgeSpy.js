
var NativeBridgeSpy = function() {
  this._calls = [];
};

NativeBridgeSpy.prototype = {

  create : function() {
    this._calls.push( { op: 'create',
                        id: arguments[0],
                        type: arguments[1],
                        properties: arguments[2] } );
  },

  set : function() {
    this._calls.push( { op: 'set',
                        id: arguments[0],
                        properties: arguments[1] } );
  },

  call : function() {
    this._calls.push( { op: 'call',
                        id: arguments[0],
                        method: arguments[1],
                        parameters: arguments[2] } );
  },

  listen : function() {
    this._calls.push( { op: 'listen',
                        id: arguments[0],
                        event: arguments[1],
                        listen: arguments[2] } );
  },

  destroy : function() {
    this._calls.push( { op: 'destroy',
                        id: arguments[0] } );
  },

  calls: function( filterProperties ) {
    return this._calls.filter( function( call ) {
      for( var key in filterProperties ) {
        if( filterProperties[key] != call[key] ) {
          return false;
        }
      }
      return true;
    });
  },

  resetCalls: function() {
    this._calls = [];
  }

};

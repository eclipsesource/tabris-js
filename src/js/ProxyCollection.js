tabris.ProxyCollection = function(array) {
  this._array = array.concat();
  for (var i = 0; i < this._array.length; i++) {
    this[i] = this._array[i];
  }
  this.length = this._array.length;
};

tabris.ProxyCollection.prototype = {

  first: function() {
    return this._array[0];
  },

  last: function() {
    return this._array[this._array.length - 1];
  },

  toArray: function() {
    return this._array.concat();
  },

  forEach: function(callback) {
    var that = this;
    this._array.forEach(function(value, index) {
      callback(value, index, that);
    });
  },

  indexOf: function(needle) {
    return this._array.indexOf(needle);
  }

};

(function() {

  tabris.ProxyCollection = function(arr, selector) {
    this._array = select(arr, selector);
    for (var i = 0; i < this._array.length; i++) {
      this[i] = this._array[i];
    }
    this.length = this._array.length;
  };

  var proto = tabris.ProxyCollection.prototype = {

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
    },

    filter: function(selector) {
      return new tabris.ProxyCollection(this._array, selector);
    },

    get: function(prop) {
      if (this._array[0]) {
        return this._array[0].get(prop);
      }
    },

    parent: function() {
      var result = [];
      for (var i = 0; i < this._array.length; i++) {
        var parent = this._array[i].parent();
        if (parent && result.indexOf(parent) === -1) {
          result.push(parent);
        }
      }
      if (result.length) {
        return new tabris.ProxyCollection(result);
      }
    },

    children: function(selector) {
      var result = [];
      for (var i = 0; i < this._array.length; i++) {
        result.push.apply(result, this._array[i]._children || []);
      }
      return new tabris.ProxyCollection(result, selector);
    },

    appendTo: function(parent) {
      parent.append(this);
    },

    dispose: function() {
      for (var i = 0; i < this._array.length; i++) {
        this._array[i].dispose();
      }
    }

  };

  ["set", "animate", "on", "off"].forEach(function(key) {
    proto[key] = function() {
      for (var i = 0; i < this._array.length; i++) {
        this._array[i][key].apply(this._array[i], arguments);
      }
      return this;
    };
  });

  var select = function(array, selector) {
    if (!array || array.length === 0) {
      return [];
    }
    if (!selector) {
      return array.concat();
    }
    var filter = getFilter(selector);
    return array.filter(filter);
  };

  var getFilter = function(selector) {
    return selector instanceof Function ? selector : function(proxy) {
      return matcher(proxy, selector);
    };
  };

  var matcher = function(proxy, selector) {
    return (selector === proxy.type) || (selector === "*");
  };

}());

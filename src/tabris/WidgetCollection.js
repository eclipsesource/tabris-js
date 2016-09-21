export default function WidgetCollection(arr, selector, deep) {
  this._array = select(arr, selector || "*", deep);
  for (var i = 0; i < this._array.length; i++) {
    this[i] = this._array[i];
  }
  this.length = this._array.length;
}

var proto = WidgetCollection.prototype = {

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
    return new WidgetCollection(this._array, selector);
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
      return new WidgetCollection(result);
    }
  },

  children: function(selector) {
    var result = [];
    for (var i = 0; i < this._array.length; i++) {
      result.push.apply(result, this._array[i]._getSelectableChildren() || []);
    }
    return new WidgetCollection(result, selector);
  },

  find: function(selector) {
    return new WidgetCollection(this.children()._array, selector, true);
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

["set", "animate", "on", "off", "once"].forEach(function(key) {
  proto[key] = function() {
    for (var i = 0; i < this._array.length; i++) {
      this._array[i][key].apply(this._array[i], arguments);
    }
    if (key !== "animate") {
      return this;
    }
  };
});

function select(array, selector, deep) {
  if (!array || array.length === 0) {
    return [];
  }
  if (selector === "*" && !deep) {
    return array.concat();
  }
  var filter = getFilter(selector);
  if (deep) {
    return deepSelect([], array, filter);
  }
  return array.filter(filter);
}

function deepSelect(result, array, filter) {
  for (var i = 0; i < array.length; i++) {
    if (filter(array[i])) {
      result.push(array[i]);
    }
    if (array[i]._children) {
      deepSelect(result, array[i]._getSelectableChildren(), filter);
    }
  }
  return result;
}

function getFilter(selector) {
  var matches = {};
  var filter = selector instanceof Function ? selector : createMatcher(selector);
  return function(widget) {
    if (matches[widget.cid]) {
      return false;
    }
    if (filter(widget)) {
      matches[widget.cid] = true;
      return true;
    }
    return false;
  };
}

function createMatcher(selector) {
  if (selector.charAt(0) === "#") {
    var expectedId = selector.slice(1);
    return function(proxy) {
      return expectedId === proxy.id;
    };
  }
  if (selector.charAt(0) === ".") {
    var expectedClass = selector.slice(1);
    return function(proxy) {
      return proxy.classList.indexOf(expectedClass) !== -1;
    };
  }
  if (selector === "*") {
    return function() {return true;};
  }
  return function(proxy) {
    return selector === proxy.type;
  };
}

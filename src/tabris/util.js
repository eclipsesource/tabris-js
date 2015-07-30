/* global util: true */
/* jshint unused: false */
var util = {

  extend: function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var name in source) {
        target[name] = source[name];
      }
    }
    return target;
  },

  pick: function(object, keys) {
    var result = {};
    for (var key in object) {
      if (keys.indexOf(key) !== -1) {
        result[key] = object[key];
      }
    }
    return result;
  },

  omit: function(object, keys) {
    var result = {};
    for (var key in object) {
      if (keys.indexOf(key) === -1) {
        result[key] = object[key];
      }
    }
    return result;
  },

  clone: function(object) {
    var result = {};
    for (var key in object) {
      result[key] = object[key];
    }
    return result;
  },

  rename: function(object, mapping) {
    var result = {};
    for (var key in object) {
      result[mapping[key] || key] = object[key];
    }
    return result;
  },

  invert: function(object) {
    var result = {};
    for (var key in object) {
      result[object[key]] = key;
    }
    return result;
  },

  bind: function(fn, context) {
    return function() {
      return fn.apply(context, arguments);
    };
  },

  extendPrototype: function(fn, target) {
    var Helper = function() {};
    Helper.prototype = fn.prototype;
    return this.extend(new Helper(), target, {
      "super": function(method) {
        return fn.prototype[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    });
  }

};

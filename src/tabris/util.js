/* global _: true */
_ = {

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

  drop: function(array, index) {
    return Array.prototype.slice.call(array, arguments.length > 1 ? index : 1);
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

  extendPrototype: function(fn, target) {
    var Helper = function() {};
    Helper.prototype = fn.prototype;
    return _.extend(new Helper(), target, {
      "_super": function(method, params) {
        return fn.prototype[method].apply(this, params);
      }
    });
  }

};

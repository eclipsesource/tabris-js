/*global NativeBridgeSpy: true */

(function() {

  NativeBridgeSpy = function() {
    this._calls = [];
  };

  NativeBridgeSpy.prototype = {

    create: function() {
      this._calls.push({
        op: "create",
        id: arguments[0],
        type: arguments[1],
        properties: arguments[2]
      });
    },

    get: function() {
      this._calls.push({
        op: "get",
        id: arguments[0],
        property: arguments[1]
      });
    },

    set: function() {
      this._calls.push({
        op: "set",
        id: arguments[0],
        properties: arguments[1]
      });
    },

    call: function() {
      this._calls.push({
        op: "call",
        id: arguments[0],
        method: arguments[1],
        parameters: arguments[2]
      });
    },

    listen: function() {
      this._calls.push({
        op: "listen",
        id: arguments[0],
        event: arguments[1],
        listen: arguments[2]
      });
    },

    destroy: function() {
      this._calls.push({
        op: "destroy",
        id: arguments[0]
      });
    },

    load: function(url) {
      return url.slice(-5) === ".json" ? "{}" : "exports = 23;";
    },

    calls: function(filterProperties) {
      tabris._nativeBridge.flush();
      return select.call(this._calls, filterProperties);
    },

    resetCalls: function() {
      tabris._nativeBridge.flush();
      this._calls = [];
    }

  };

  function select(filterProperties) {
    return this.filter((call) => {
      for (var key in filterProperties) {
        if (filterProperties[key] !== call[key]) {
          return false;
        }
      }
      return true;
    });
  }

}());

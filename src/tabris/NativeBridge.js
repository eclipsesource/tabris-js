import Layout from "./Layout";

export default function NativeBridge(bridge) {
  this._bridge = bridge;
  this._operations = [];
  this._currentOperation = {id: null};
  tabris._on("flush", this.flush, this);
}

NativeBridge.prototype = {

  create: function(id, type) {
    var properties = {};
    this._operations.push(["create", id, type, properties]);
    this._currentOperation = {id: id, properties: properties};
  },

  set: function(id, name, value) {
    if (this._currentOperation.id === id) {
      this._currentOperation.properties[name] = value;
    } else {
      var properties = {};
      properties[name] = value;
      this._operations.push(["set", id, properties]);
      this._currentOperation = {id: id, properties: properties};
    }
  },

  listen: function(id, event, listen) {
    this._operations.push(["listen", id, event, listen]);
    this._currentOperation = {id: null};
  },

  destroy: function(id) {
    this._operations.push(["destroy", id]);
    this._currentOperation = {id: null};
  },

  get: function(id, name) {
    this.flush();
    return this._bridge.get(id, name);
  },

  call: function(id, method, parameters) {
    this.flush();
    return this._bridge.call(id, method, parameters);
  },

  flush: function() {
    Layout.flushQueue();
    var operations = this._operations;
    this._operations = [];
    this._currentOperation = {id: null};
    var length = operations.length;
    // Using apply() on the native bridge does not work with Rhino. It seems that the parameter
    // count must be known in order to find the associated native method.
    for (var i = 0; i < length; i++) {
      var op = operations[i];
      switch (op[0]) {
        case "create":
          this._bridge.create(op[1], op[2], op[3]);
          break;
        case "set":
          this._bridge.set(op[1], op[2]);
          break;
        case "listen":
          this._bridge.listen(op[1], op[2], op[3]);
          break;
        case "destroy":
          this._bridge.destroy(op[1]);
      }
    }
  }
};

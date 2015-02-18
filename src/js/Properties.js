tabris.Properties = {

  set: function(arg1, arg2) {
    this._checkDisposed();
    if (typeof arg1 === "string") {
      this._setProperty(arg1, arg2);
    } else {
      this._setProperties(arg1);
    }
    return this;
  },

  get: function(name) {
    this._checkDisposed();
    if (this._props && name in this._props) {
      return this._props[name];
    }
    return this._readProperty(name);
  },

  _setProperties: function(properties) {
    for (var name in properties) {
      this._setProperty(name, properties[name]);
    }
  },

  _setProperty: function(name, value) {
    var accept = this._applyProperty(name, value);
    if (accept) {
      if (!this._props) {
        this._props = {};
      }
      this._props[name] = value;
    }
  },

  _checkDisposed: function() {},
  _applyProperty: function() {return true;},
  _readProperty: function() {return undefined;}

};

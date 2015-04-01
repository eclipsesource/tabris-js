tabris.Properties = {

  set: function(arg1, arg2, arg3) {
    this._checkDisposed();
    if (typeof arg1 === "string") {
      this._setProperty(arg1, arg2, arg3 || {});
    } else {
      this._setProperties(arg1, arg2 || {});
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

  _setProperties: function(properties, options) {
    for (var name in properties) {
      this._setProperty(name, properties[name], options);
    }
  },

  _setProperty: function(name, value, options) {
    var accept = this._applyProperty(name, value, options);
    if (accept) {
      if (!this._props) {
        this._props = {};
      }
      var oldValue = this._props[name];
      this._props[name] = value;
      if (oldValue !== value) {
        this.trigger("change:" + name, this, value, options);
      }
    }
  },

  _checkDisposed: function() {},
  _applyProperty: function() {return true;},
  _readProperty: function() {return undefined;},
  trigger: function() {}

};

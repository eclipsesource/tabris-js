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
    var value = this._getStoredProperty(name);
    value = this._readProperty(name, value);
    return this._decodeProperty(value, this._getPropertyType(name));
  },

  _getStoredProperty: function(name) {
    return this._props ? this._props[name] : undefined;
  },

  _setProperties: function(properties, options) {
    for (var name in properties) {
      this._setProperty(name, properties[name], options);
    }
  },

  _setProperty: function(name, value, options) {
    var type = this._getPropertyType(name);
    var encodedValue;
    try {
      encodedValue = this._encodeProperty(value, type);
    } catch (ex) {
      console.warn(this.toString() + ": Ignored unsupported value for property \"" + name + "\": " + ex.message);
      return;
    }
    encodedValue = this._applyProperty(name, encodedValue, options);
    var changed = this._storeProperty(name, encodedValue, options);
    if (changed) {
      this.trigger("change:" + name, this, this._decodeProperty(encodedValue, type), options);
    }
  },

  _storeProperty: function(name, encodedValue) {
    var oldEncodedValue = this._props ? this._props[name] : undefined;
    if (encodedValue === oldEncodedValue) {
      return false;
    }
    if (encodedValue === undefined && this._props) {
      delete this._props[name];
    } else {
      if (!this._props) {
        this._props = {};
      }
      this._props[name] = encodedValue;
    }
    return true;
  },

  _getPropertyType: function(name) {
    var prop = this.constructor._properties[name];
    return prop ? prop.type : null;
  },

  _encodeProperty: function(value, type) {
    if (typeof type === "string" && tabris.PropertyEncoding[type]) {
      return tabris.PropertyEncoding[type](value);
    }
    if (Array.isArray(type) && tabris.PropertyEncoding[type[0]]) {
      var args = [value].concat(type.slice(1));
      return tabris.PropertyEncoding[type[0]].apply(window, args);
    }
    return value;
  },

  _decodeProperty: function(value, type) {
    if (typeof type === "string" && tabris.PropertyDecoding[type]) {
      return tabris.PropertyDecoding[type](value);
    }
    if (Array.isArray(type) && tabris.PropertyDecoding[type[0]]) {
      var args = [value].concat(type.slice(1));
      return tabris.PropertyDecoding[type[0]].apply(window, args);
    }
    return value;
  },

  _checkDisposed: function() {},
  _applyProperty: function(name, value) {return value;},
  _readProperty: function(name, value) {return value;},
  trigger: function() {}

};

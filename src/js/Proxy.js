(function() {

  tabris.Proxy = function(cid) {
    this.cid = cid || generateId();
    tabris._proxies[this.cid] = this;
  };

  util.extend(tabris.Proxy.prototype, tabris.Properties, tabris.Events, {

    _create: function(properties) {
      var type = this.constructor._type || this.type;
      tabris._nativeBridge.create(this.cid, type);
      if (this.constructor._initProperties) {
        for (var name in this.constructor._initProperties) {
          this._nativeSet(name, this.constructor._initProperties[name]);
        }
      }
      this._setProperties(properties || {});
      return this;
    },

    dispose: function() {
      if (!this._isDisposed) {
        this._destroy();
        tabris._nativeBridge.destroy(this.cid);
        if (this._parent) {
          this._parent._removeChild(this);
        }
        this._isDisposed = true;
      }
    },

    isDisposed: function() {
      return !!this._isDisposed;
    },

    _listen: function(event, state) {
      var config = this._getEventConfig(event);
      if (!config || this._isListeningToAlias(event, config)) {
        return;
      }
      if (config.listen) {
        config.listen.call(this, state, config.alias === event);
      } else {
        this._nativeListen(config.name, state);
      }
    },

    _isListeningToAlias: function(event, config) {
      if (!config.alias) {
        return false;
      }
      var other = event === config.originalName ?  config.alias : config.originalName;
      return this._isListening(other);
    },

    _nativeListen: function(event, state) {
      tabris._nativeBridge.listen(this.cid, event, state);
    },

    _trigger: function(event, params) {
      var name = this.constructor._trigger[event];
      var trigger = name && this.constructor._events[name].trigger;
      if (trigger instanceof Function) {
        trigger.call(this, params, name);
      } else if (name) {
        this.trigger(name, params);
      } else {
        this.trigger(event, params);
      }
    },

    _destroy: function() {
      this.trigger("dispose", this, {});
      this._destroyChildren();
      tabris.Events.off.call(this);
      delete tabris._proxies[this.cid];
    },

    _destroyChildren: function() {
    },

    _checkDisposed: function() {
      if (this._isDisposed) {
        throw new Error("Object is disposed");
      }
    },

    _applyProperty: function(name, value, options) {
      var type = this._getPropertyType(name);
      if (!type) {
        return true;
      }
      var encodedValue;
      try {
        encodedValue = this._encodeProperty(value, type);
      } catch (ex) {
        console.warn(this.type + ": Ignored unsupported value for property \"" + name + "\": " + ex.message);
        return false;
      }
      var setProperty = this._getPropertySetter(name);
      if (setProperty instanceof Function) {
        setProperty.call(this, encodedValue);
      } else {
        this._nativeSet(name, tabris.PropertyEncoding.proxy(encodedValue));
      }
      this._cacheProperty(name, encodedValue, options);
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

    _getPropertyType: function(name) {
      var prop = this.constructor._properties[name];
      return prop ? prop.type : null;
    },

    _getPropertySetter: function(name) {
      var prop = this.constructor._properties[name];
      return prop ? prop.set : null;
    },

    _getEventConfig: function(type) {
      return this.constructor._events[type];
    },

    _nativeSet: function(name, value) {
      tabris._nativeBridge.set(this.cid, name, value);
    },

    _readProperty: function(name) {
      var type = this._getPropertyType(name);
      if (!type) {
        return;
      }
      if (this._isCachedProperty(name)) {
        return this._decodeProperty(this._getCachedProperty(name), type);
      }
      // TODO: cache read property, but add nocache to device properties first
      var getProperty = this._getPropertyGetter(name);
      var value = getProperty ? getProperty.call(this) : this._nativeGet(name);
      return this._decodeProperty(value, type);
    },

    _getPropertyGetter: function(name) {
      var prop = this.constructor._properties[name];
      return prop ? prop.get : null;
    },

    _nativeGet: function(name) {
      return tabris._nativeBridge.get(this.cid, name);
    },

    _nativeCall: function(method, parameters) {
      this._checkDisposed();
      return tabris._nativeBridge.call(this.cid, method, parameters);
    },

    _cacheProperty: function(name, value, options) {
      if (!this.constructor._properties[name].nocache) {
        if (!this._propertyCache) {
          this._propertyCache = {};
        }
        var cached = this._isCachedProperty(name);
        var previous = cached ? this._getCachedProperty(name) : undefined;
        this._propertyCache[name] = value;
        if (!cached || !propertyEquals(previous, value)) {
          this._triggerChangeEvent(name, value, options);
        }
      } else {
        this._triggerChangeEvent(name, value, options);
      }
    },

    _isCachedProperty: function(name) {
      return (this._propertyCache && name in this._propertyCache) ||
        "default" in this.constructor._properties[name];
    },

    _getCachedProperty: function(name) {
      if (this._propertyCache && name in this._propertyCache) {
        return this._propertyCache[name];
      }
      return valueOf(this.constructor._properties[name].default);
    },

    _triggerChangeEvent: function(propertyName, newEncodedValue, options) {
      var type = this._getPropertyType(propertyName);
      var decodedValue = this._decodeProperty(newEncodedValue, type);
      this.trigger("change:" + propertyName, this, decodedValue, options || {});
    }

  });

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

  function valueOf(value) {
    return value instanceof Function ? value() : value;
  }

  function propertyEquals(value1, value2) {
    // NOTE: this deep-compare is designed only for certain encoded properties (color, image, etc)
    if (value1 === value2) {
      return true;
    }
    if (value1 instanceof Array && value2 instanceof Array) {
      for (var i = 0; i < value1.length; i++) {
        if (value1[i] !== value2[i]) {
          return false;
        }
      }
      return true;
    }
    if (value1 instanceof Object && value2 instanceof Object) {
      for (var key in value1) {
        if (value1[key] !== value2[key]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

})();

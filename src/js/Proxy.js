(function() {

  tabris.Proxy = function(cid) {
    this.cid = cid || generateId();
    tabris._proxies[this.cid] = this;
  };

  util.extend(tabris.Proxy.prototype, tabris.Events, tabris.Properties, {

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

    _listen: function(type, state) {
      var event = this._getEventConfig(type);
      if (!event) {
        return;
      }
      if (event.listen) {
        event.listen.call(this, state);
      } else {
        this._nativeListen(event.name, state);
      }
    },

    _nativeListen: function(event, state) {
      tabris._nativeBridge.listen(this.cid, event, state);
    },

    _trigger: function(event, params) {
      var name = this.constructor._trigger[event];
      var trigger = name && this.constructor._events[name].trigger;
      if (trigger instanceof Function) {
        trigger.call(this, params);
      } else if (name) {
        this.trigger(name, params);
      } else {
        this.trigger(event, params);
      }
    },

    _destroy: function() {
      this.trigger("dispose", {});
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

    _applyProperty: function(name, value) {
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
      this._cacheProperty(name, encodedValue);
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
      } else if ("default" in this.constructor._properties[name]) {
        return valueOf(this.constructor._properties[name].default);
      }
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

    _cacheProperty: function(name, value) {
      if (!this.constructor._properties[name].nocache) {
        if (!this._propertyCache) {
          this._propertyCache = {};
        }
        this._propertyCache[name] = value;
      }
    },

    _isCachedProperty: function(name) {
      return this._propertyCache && name in this._propertyCache;
    },

    _getCachedProperty: function(name) {
      return this._propertyCache[name];
    }

  });

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

  function valueOf(value) {
    return value instanceof Function ? value() : value;
  }

})();

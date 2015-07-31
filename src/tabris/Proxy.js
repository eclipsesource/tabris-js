(function() {

  tabris.Proxy = function(cid) {
    this.cid = cid || generateId();
    tabris._proxies[this.cid] = this;
  };

  _.extend(tabris.Proxy.prototype, tabris.Properties, tabris.Events, {

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
      this._dispose();
    },

    _dispose: function(skipNative) {
      if (!this._isDisposed && !this._inDispose) {
        this._inDispose = true;
        this.trigger("dispose", this, {});
        this._release();
        if (!skipNative) {
          tabris._nativeBridge.destroy(this.cid);
        }
        delete tabris._proxies[this.cid];
        this._isDisposed = true;
      }
    },

    _release: function() {
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

    _checkDisposed: function() {
      if (this._isDisposed) {
        throw new Error("Object is disposed");
      }
    },

    _applyProperty: function(name, value, options) {
      if (!this._getPropertyType(name)) {
        return value;
      }
      var setProperty = this._getPropertySetter(name);
      if (setProperty instanceof Function) {
        setProperty.call(this, name, value);
      } else {
        this._nativeSet(name, value);
      }
      if (this.constructor._properties[name].nocache) {
        this._triggerChangeEvent(name, value, options);
      } else {
        return value === this._getDefaultPropertyValue(name) ? undefined : value;
      }
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

    _readProperty: function(name, value) {
      if (!this._getPropertyType(name)) {
        return value;
      }
      var result = value;
      if (result === undefined) {
        result = this._getDefaultPropertyValue(name);
      }
      if (result === undefined) {
        // TODO: cache read property, but add nocache to device properties first
        var getProperty = this._getPropertyGetter(name);
        result = getProperty ? getProperty.call(this, name) : this._nativeGet(name);
      }
      return result;
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

    _getDefaultPropertyValue: function(name) {
      return valueOf(this.constructor._properties[name].default);
    },

    _triggerChangeEvent: function(propertyName, newEncodedValue, options) {
      var type = this._getPropertyType(propertyName);
      var decodedValue = this._decodeProperty(newEncodedValue, type);
      this.trigger("change:" + propertyName, this, decodedValue, options || {});
    },

    toString: function() {
      return this.type;
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

(function() {

  tabris.Proxy = function(cid) {
    this.cid = cid || generateId();
    tabris._proxies[this.cid] = this;
  };

  util.extend(tabris.Proxy.prototype, tabris.Events, tabris.Properties, {

    _create: function(properties) {
      var type = this.constructor._type || this.type;
      tabris._nativeBridge.create(this.cid, type);
      if (this.constructor && this.constructor._initProperties) {
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

    _listen: function(type, state) {
      var event = this.constructor && this.constructor._events && this.constructor._events[type];
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
      // TODO: all these && pre-checks can be removed once no one uses new tabris.Proxy anymore
      var name = this.constructor && this.constructor._trigger && this.constructor._trigger[event];
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
        encodedValue = this._encodeProperty(value, type, name);
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
      var prop = this.constructor && this.constructor._properties && this.constructor._properties[name];
      return typeof prop === "object" && prop.type ? prop.type : prop;
    },

    _getPropertySetter: function(name) {
      var prop = this.constructor && this.constructor._properties && this.constructor._properties[name];
      if (typeof prop === "object" && prop.set) {
        return prop.set;
      }
      return null;
    },

    _nativeSet: function(name, value) {
      tabris._nativeBridge.set(this.cid, name, value);
    },

    _readProperty: function(name) {
      var type = this._getPropertyType(name);
      if (!type) {
        return;
      }
      var getProperty = this._getPropertyGetter(name);
      var value = getProperty ? getProperty.call(this) : this._nativeGet(name);
      return this._decodeProperty(value, type);
    },

    _getPropertyGetter: function(name) {
      var prop = this.constructor && this.constructor._properties && this.constructor._properties[name];
      if (typeof prop === "object" && prop.get) {
        return prop.get;
      }
      return null;
    },

    _nativeGet: function(name) {
      return tabris._nativeBridge.get(this.cid, name);
    },

    _nativeCall: function(method, parameters) {
      this._checkDisposed();
      return tabris._nativeBridge.call(this.cid, method, parameters);
    }

  });

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

})();

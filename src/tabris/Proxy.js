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
        return trigger.call(this, params, name);
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
    _getEventConfig: function(type) {
      return this.constructor._events[type];
    },

    _nativeSet: function(name, value) {
      tabris._nativeBridge.set(this.cid, name, value);
    },

    _nativeGet: function(name) {
      return tabris._nativeBridge.get(this.cid, name);
    },

    _nativeCall: function(method, parameters) {
      this._checkDisposed();
      return tabris._nativeBridge.call(this.cid, method, parameters);
    },

    toString: function() {
      return this.type;
    }

  });

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

})();

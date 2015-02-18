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
      this._setProperties(properties);
      return this;
    },

    append: function() {
      this._checkDisposed();
      var proxies = arguments[0] instanceof tabris.ProxyCollection ? arguments[0].toArray() : arguments;
      for (var i = 0; i < proxies.length; i++) {
        if (!(proxies[i] instanceof tabris.Proxy)) {
          throw new Error("Cannot append non-widget");
        }
        proxies[i]._setParent(this);
      }
      return this;
    },

    appendTo: function(proxy) {
      this._checkDisposed();
      proxy = proxy instanceof tabris.ProxyCollection ? proxy.first() : proxy;
      if (!(proxy instanceof tabris.Proxy)) {
        throw new Error("Cannot append to non-widget");
      }
      this._setParent(proxy);
      return this;
    },

    call: function(method, parameters) {
      this._checkDisposed();
      return tabris._nativeBridge.call(this.cid, method, parameters);
    },

    apply: function(sheet) {
      var scope = new tabris.ProxyCollection(this._children.concat(this), "*", true);
      if (sheet["*"]) {
        scope.set(sheet["*"]);
      }
      var selector;
      for (selector in sheet) {
        if (selector !== "*" && selector[0] !== "#") {
          scope.filter(selector).set(sheet[selector]);
        }
      }
      for (selector in sheet) {
        if (selector[0] === "#") {
          scope.filter(selector).set(sheet[selector]);
        }
      }
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

    parent: function() {
      return this._parent;
    },

    children: function(selector) {
      return new tabris.ProxyCollection(this._children, selector);
    },

    find: function(selector) {
      return new tabris.ProxyCollection(this._children, selector, true);
    },

    _listen: function(event, state) {
      var listen = this.constructor && this.constructor._listen && this.constructor._listen[event];
      if (!listen) {
        return;
      }
      if (typeof listen === "string") {
        this._nativeListen(listen, state);
      } else if (listen instanceof Function) {
        listen.call(this, state);
      } else {
        this._nativeListen(event, state);
      }
    },

    _nativeListen: function(event, state) {
      tabris._nativeBridge.listen(this.cid, event, state);
    },

    _trigger: function(event, params) {
      // TODO: all these && pre-checks can be removed once no one uses new tabris.Proxy anymore
      var trigger = this.constructor && this.constructor._trigger && this.constructor._trigger[event];
      if (trigger instanceof Function) {
        trigger.call(this, params);
      } else if (typeof trigger === "string") {
        this.trigger(trigger, params);
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
      if (this._children) {
        for (var i = 0; i < this._children.length; i++) {
          this._children[i]._destroy();
        }
      }
    },

    _addChild: function(child) {
      var check = this.constructor && this.constructor._supportsChildren;
      if (check === false) {
        throw new Error(this.type + " cannot contain children");
      }
      if (typeof check === "function" && !check(child)) {
        throw new Error(this.type + " cannot contain children of type " + child.type);
      }
      if (!this._children) {
        this._children = [];
      }
      this._children.push(child);
      this.trigger("addchild", child, this, {});
    },

    _removeChild: function(child) {
      if (this._children) {
        var index = this._children.indexOf(child);
        if (index !== -1) {
          this._children.splice(index, 1);
        }
        this.trigger("removechild", child, this, {index: index});
      }
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
      var encodedValue = this._encodeProperty(value, type, name);
      var setProperty = this._getPropertySetter(name);
      try {
        if (setProperty instanceof Function) {
          setProperty.call(this, encodedValue);
        } else {
          this._nativeSet(name, tabris.PropertyEncoding.proxy(encodedValue));
        }
      } catch (error) {
        console.warn(this.type + ": Failed to set property \"" + name + "\" value: " + error.message);
      }
    },

    _encodeProperty: function(value, type, name) {
      try {
        if (typeof type === "string" && tabris.PropertyEncoding[type]) {
          return tabris.PropertyEncoding[type](value);
        }
        if (Array.isArray(type) && tabris.PropertyEncoding[type[0]]) {
          var args = [value].concat(type.slice(1));
          return tabris.PropertyEncoding[type[0]].apply(window, args);
        }
        return value;
      } catch (ex) {
        console.warn(this.type + ": Unsupported value for property \"" + name + "\": " + ex.message);
      }
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
      if (this.constructor && this.constructor._properties === true) {
        return true; // TODO: Remove support for _properties: true
      }
      return this.constructor && this.constructor._properties && this.constructor._properties[name];
    },

    _getPropertySetter: function(name) {
      return this.constructor && this.constructor._setProperty && this.constructor._setProperty[name];
    },

    _nativeSet: function(name, value) {
      tabris._nativeBridge.set(this.cid, name, value);
    },

    _readProperty: function(name) {
      var type = this._getPropertyType(name);
      var getProperty = this.constructor && this.constructor._getProperty && this.constructor._getProperty[name];
      var value = getProperty ? getProperty.call(this) : this._nativeGet(name);
      return this._decodeProperty(value, type);
    },

    _nativeGet: function(name) {
      return tabris._nativeBridge.get(this.cid, name);
    },

    _getContainer: function() {
      return this;
    },

    _setParent: function(parent) {
      tabris._nativeBridge.set(this.cid, "parent", tabris.PropertyEncoding.proxy(parent._getContainer()));
      if (this._parent) {
        this._parent._removeChild(this);
      }
      this._parent = parent;
      this._parent._addChild(this);
    }

  });

  var idSequence = 1;

  function generateId() {
    return "o" + (idSequence++);
  }

})();

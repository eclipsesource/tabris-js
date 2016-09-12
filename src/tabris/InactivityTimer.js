(function() {

  tabris.registerType("InactivityTimer", {

    _type: "tabris.InactivityTimer",

    _properties: {
      delay: {
        type: "natural",
        default: 0
      }
    },

    _events: {
      timeout: {
        trigger: function() {
          this.trigger("timeout", this, {});
        }
      }
    },

    start: function() {
      this._nativeCall("start");
    },

    cancel: function() {
      this._nativeCall("cancel");
    }

  });

})();

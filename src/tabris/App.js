tabris.registerType("_App", {
  _type: "tabris.App",
  _events: {
    pause: {name: "Pause", trigger: triggerWithTarget},
    resume: {name: "Resume", trigger: triggerWithTarget},
    open: {name: "Open", trigger: triggerWithTarget},
    patchInstall: {trigger: notifyPatchCallback},
    backnavigation: {
      trigger: function() {
        var options = {};
        this.trigger("backnavigation", this, options);
        return options.preventDefault === true;
      }
    }
  },
  dispose: function() {
    throw new Error("tabris.app can not be disposed");
  },
  reload: function() {
    this._nativeCall("reload", {});
  },
  installPatch: function(url, callback) {
    if (typeof url !== "string") {
      throw new Error("parameter url is not a string");
    }
    if (!this._pendingPatchCallback) {
      this._pendingPatchCallback = callback || true;
      this._listen("patchInstall", true);
      this._nativeCall("installPatch", {url: url});
    } else if (typeof callback === "function") {
      callback(new Error("Another installPatch operation is already pending."));
    }
  }
});

tabris.load(function() {
  tabris.app = tabris("_App");
});

function triggerWithTarget(event, name) {
  this.trigger(name, this, event);
}

function notifyPatchCallback(event) {
  this._listen("patchInstall", false);
  var callback = this._pendingPatchCallback;
  delete this._pendingPatchCallback;
  if (typeof callback === "function") {
    if (event.error) {
      callback(new Error(event.error));
    } else {
      try {
        var patch = event.success ? JSON.parse(event.success) : null;
        callback(null, patch);
      } catch (error) {
        callback(new Error("Failed to parse patch.json"));
      }
    }
  }
}

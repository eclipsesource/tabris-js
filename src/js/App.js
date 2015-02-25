tabris.registerType("_App", {
  _type: "tabris.App",
  _events: {pause: "Pause", resume: "Resume"},
  dispose: function() {
    throw new Error("tabris.app can not be disposed");
  }
});

tabris.app = tabris("_App");

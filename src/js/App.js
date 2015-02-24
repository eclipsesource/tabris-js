tabris.registerType("_App", {
  _type: "tabris.App",
  _listen: {pause: "Pause", resume: "Resume"},
  _trigger: {Pause: "pause", Resume: "resume"},
  dispose: function() {
    throw new Error("tabris.app can not be disposed");
  }
});

tabris.app = tabris("_App");

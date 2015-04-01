tabris.registerType("_App", {
  _type: "tabris.App",
  _events: {
    pause: {name: "Pause", trigger: triggerWithTarget},
    resume: {name: "Resume", trigger: triggerWithTarget}
  },
  dispose: function() {
    throw new Error("tabris.app can not be disposed");
  }
});

tabris.app = tabris("_App");

function triggerWithTarget(event, name) {
  this.trigger(name, this, event);
}

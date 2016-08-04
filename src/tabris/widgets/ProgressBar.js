tabris.registerWidget("ProgressBar", {
  _type: "tabris.ProgressBar",
  _properties: {
    minimum: {type: "integer", default: 0},
    maximum: {type: "integer", default: 100},
    selection: {type: "integer", default: 0},
    state: {type: ["choice", ["normal", "paused", "error"]], default: "normal"}
  }
});

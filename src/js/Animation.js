(function(require) {

  var util = require("tabris-util");

  tabris.registerType("_Animation", {
    _type: "tabris.Animation",
    _listen: {Completion: true, Progress: true, Start: true},
    _properties: true
  });

  tabris.Animation = {

    validOptions: {delay: true, duration: true, repeat: true, reverse: true, easing: true},

    animate: function(target, properties, options) {
      var validatedOptions = {};
      for (var option in options) {
        if (this.validOptions[option]) {
          validatedOptions[option] = options[option];
        } else {
          console.warn("Invalid animation option \"" + option + "\"");
        }
      }
      tabris.create("_Animation", util.extend(validatedOptions, {
        target: target,
        properties: properties
      })).on("Completion", function() {
        this.dispose();
      }).call("start");
    }

  };

}(tabris.Module.require));

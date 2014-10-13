tabris.load(function() {

  var MARGIN = 16;

  var page = tabris.create("Page", {
    title: "App Service",
    topLevel: true
  });

  var pauseLabel = tabris.create("Label", {
    style: ["BORDER"],
    layoutData: {left: MARGIN, top: MARGIN, right: MARGIN},
    text: "Pause: not yet"
  });

  var resumeLabel = tabris.create("Label", {
    style: ["BORDER"],
    layoutData: {left: MARGIN, top: [pauseLabel, MARGIN], right: MARGIN},
    text: "Resume: not yet"
  });

  page.append(pauseLabel, resumeLabel);

  var app = tabris("tabris.App");

  app.on("Pause", function() {
    pauseLabel.set("text", "Pause: Yes");
  });

  app.on("Resume", function() {
    resumeLabel.set("text", "Resume: Yes");
  });

  var backNavListener = function() {
    resumeLabel.set("text", "Resume: reset");
    pauseLabel.set("text", "Pause: reset");
    app.off("BackNavigation", backNavListener);
  };

  app.on("BackNavigation", backNavListener);

  page.open();

});

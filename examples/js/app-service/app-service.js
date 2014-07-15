tabris.load(function() {

  var MARGIN = 16;

  var page = tabris.createPage({
    title: "App Service",
    topLevel: true
  });

  var pauseLabel = page.append("Label", {
    style: ["BORDER"],
    layoutData: {left: MARGIN, top: MARGIN, right: MARGIN},
    text: "Pause: not yet"
  });

  var resumeLabel = page.append("Label", {
    style: ["BORDER"],
    layoutData: {left: MARGIN, top: [pauseLabel, MARGIN], right: MARGIN},
    text: "Resume: not yet"
  });

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
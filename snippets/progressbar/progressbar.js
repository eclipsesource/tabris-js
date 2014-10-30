tabris.load(function() {

  var MARGIN = 15;
  var STEPS = 200;

  var page = tabris.create("Page", {
    title: "Creating a progress bar and setting its selection",
    topLevel: true
  });

  var progressBar = tabris.create("ProgressBar", {
    layoutData: {left: MARGIN, right: MARGIN, top: MARGIN},
    minimum: 0,
    maximum: STEPS,
    selection: 0
  }).appendTo(page);

  setInterval(function() {
    var selection = progressBar.get("selection");
    progressBar.set("selection", selection < STEPS ? selection + 1 : clearTimeout(this));
  }, 20);

  page.open();

});

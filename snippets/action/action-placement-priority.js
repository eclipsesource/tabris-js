tabris.load(function() {

  var lowCounter = 0;
  var highCounter = 0;

  var page = tabris.create("Page", {
    title: "Action placement priority",
    topLevel: true
  });

  var createActionHandler = function(placementPriority) {
    return function() {
      tabris.create("Action", {
        title: placementPriority + " " + (placementPriority === "HIGH" ? ++highCounter : ++lowCounter),
        placementPriority: placementPriority
      });
    };
  };

  var lowPlacementPriorityButton = tabris.create("Button", {
    layoutData: {left: 10, top: 10, right: 10},
    text: "Add a low placement priority action"
  }).on("touchend", createActionHandler("LOW")).appendTo(page);

  tabris.create("Button", {
    layoutData: {left: 10, top: [lowPlacementPriorityButton, 10], right: 10},
    text: "Add a high placement priority action"
  }).on("touchend", createActionHandler("HIGH")).appendTo(page);

  page.open();

});

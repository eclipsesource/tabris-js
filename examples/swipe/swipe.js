tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Swipe",
    topLevel: true
  });

  var mainComposite = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0},
    data: {
      swipe: true
    }
  });

  var item1 = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var item2 = tabris.create("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var swipe = tabris.create("tabris.Swipe", {
    itemCount: 2
  }).appendTo(mainComposite);

  var item1Label = tabris.create("Label", {
    layoutData: {right: 10, top: [50, 0]},
    text: "Drag me to the left to see the next page"
  });

  var item2Label = tabris.create("Label", {
    layoutData: {left: 8, right: 10, top: 8},
    text: "Hello, I am the second swipe item"
  });

  var lockButton = tabris.create("Button", {
    layoutData: {left: 8, right: 10, bottom: 8},
    text: "lock swiping"
  });

  item1.append(item1Label, lockButton);
  item2.append(item2Label);
  mainComposite.append(item1, item2);
  page.append(mainComposite);

  swipe.call("add", {
    index: 0,
    control: item1.id
  });

  swipe.call("add", {
    index: 1,
    control: item2.id
  });

  swipe.set("active", 0);

  var locked = false;

  lockButton.on("selection", function() {
    if (!locked) {
      swipe.call("lockRight", {
        index: 0
      });
      lockButton.set("text", "unlock swiping");
      locked = true;
    } else {
      swipe.call("unlockRight", {
        index: 0
      });
      lockButton.set("text", "lock swiping");
      locked = false;
    }
  });

  page.open();

});

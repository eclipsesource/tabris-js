tabris.load(function() {

  var page = tabris.createPage({
    title: "Swipe",
    topLevel: true
  });

  var mainComposite = page.append("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}, data: { swipe: true }
  });
  var item1 = mainComposite.append("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });
  var item2 = mainComposite.append("Composite", {
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var swipe = mainComposite.append("tabris.Swipe", {
    itemCount: 2
  });

  swipe.call("add", {
    index: 0,
    control: item1.id
  });

  swipe.call("add", {
    index: 1,
    control: item2.id
  });

  swipe.set("active", 0 );

  var lockButton = item1.append("Button", {
    layoutData: {left: 8, right: 10, bottom: 8},
    text: "lock swiping"
  });

  var locked = false;

  lockButton.on("selection", function() {
    if( !locked ) {
      swipe.call("lockRight", {
        index: 0
      });
      lockButton.set( "text", "unlock swiping" );
      locked = true;
    } else {
      swipe.call("unlockRight", {
        index: 0
      });
      lockButton.set( "text", "lock swiping" );
      locked = false;
    }
  });

  item1.append("Label", {
    layoutData: { right: 10, top: [50, 0 ]},
    text: "Drag me to the left to see the next page"
  });

  item2.append("Label", {
    layoutData: {left: 8, right: 10, top: 8},
    text: "Hello, I am the second swipe item"
  });

  page.open();

});

tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Storing data on the device",
    topLevel: true
  });

  var keyLabel = tabris.create("Label", {
    layoutData: {left: 10, top: 20},
    text: "Key:"
  }).appendTo(page);

  var keyField = tabris.create("Text", {
    layoutData: {left: [keyLabel, 20], baseline: keyLabel, right: 10},
    text: "foo"
  }).appendTo(page);

  var valueLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [keyField, 20]},
    text: "Value:"
  }).appendTo(page);

  var valueField = tabris.create("Text", {
    layoutData: {left: [valueLabel, 20], baseline: valueLabel, right: 10},
    text: localStorage.getItem("foo") || "bar"
  }).appendTo(page);

  var setButton = tabris.create("Button", {
    layoutData: {left: 10, top: [valueLabel, 20]},
    text: "Set"
  }).on("selection", function() {
    localStorage.setItem(keyField.get("text"), valueField.get("text"));
    valueField.set("text", "");
  }).appendTo(page);

  var getButton = tabris.create("Button", {
    layoutData: {left: [setButton, 10], baseline: setButton},
    text: "Get"
  }).on("selection", function() {
    valueField.set("text", localStorage.getItem(keyField.get("text")));
  }).appendTo(page);

  var removeButton = tabris.create("Button", {
    layoutData: {left: [getButton, 10], baseline: setButton},
    text: "Remove"
  }).on("selection", function() {
    localStorage.removeItem(keyField.get("text"));
    valueField.set("text", "");
  }).appendTo(page);

  tabris.create("Button", {
    layoutData: {left: [removeButton, 10], baseline: setButton},
    text: "Clear"
  }).on("selection", function() {
    localStorage.clear();
    valueField.set("text", "");
  }).appendTo(page);

  page.open();

});

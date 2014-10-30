tabris.load(function() {

  var MARGIN = 8;
  var MARGIN_LARGE = 16;
  var STORAGE_KEY = "message";

  var page = tabris.create("Page", {
    title: "Storing key/value data pairs on the device",
    topLevel: true
  });

  var storeText = tabris.create("Text", {
    text: "Hallo World!",
    message: "String to store",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN}
  });

  var addButton = tabris.create("Button", {
    text: "Add",
    layoutData: {left: MARGIN, right: [66.6, MARGIN], top: [storeText, MARGIN_LARGE]}
  });

  var removeButton = tabris.create("Button", {
    text: "Remove",
    layoutData: {left: [33.3, 0], right: [33.3, 0], top: [storeText, MARGIN_LARGE]}
  });

  var clearButton = tabris.create("Button", {
    text: "Clear",
    layoutData: {left: [66.6, MARGIN], right: MARGIN, top: [storeText, MARGIN_LARGE]}
  });

  var storeLabel = tabris.create("Label", {
    style: ["WRAP"],
    layoutData: {left: MARGIN, top: [addButton, MARGIN_LARGE], right: MARGIN},
    markupEnabled: true
  });

  page.append(storeText, addButton, removeButton, clearButton, storeLabel);

  function updateStoreLabel() {
    var value = localStorage.getItem(STORAGE_KEY);
    storeLabel.set("text", "<b>Store content:</b><br />".concat(value));
  }

  addButton.on("selection", function() {
    localStorage.setItem(STORAGE_KEY, storeText.get("text"));
    updateStoreLabel();
  });

  removeButton.on("selection", function() {
    localStorage.removeItem(STORAGE_KEY);
    updateStoreLabel();
  });

  clearButton.on("selection", function() {
    localStorage.clear();
    updateStoreLabel();
  });

  updateStoreLabel();

  page.open();

});

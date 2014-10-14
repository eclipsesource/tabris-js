tabris.load(function() {

  var MARGIN = 8;
  var MARGIN_LARGE = 16;
  var STORAGE_KEY = "message";

  var page = tabris.createPage({
    title: "Local storage",
    topLevel: true
  });

  var storeText = page.append("Text", {
    text: "Hallo World!",
    message: "String to store",
    layoutData: {left: MARGIN, top: MARGIN_LARGE, right: MARGIN}
  });

  var addButton = page.append("Button", {
    text: "Add",
    layoutData: {left: MARGIN, right: [66.6, MARGIN], top: [storeText, MARGIN_LARGE]}
  });

  var removeButton = page.append("Button", {
    text: "Remove",
    layoutData: {left: [33.3, 0], right: [33.3, 0], top: [storeText, MARGIN_LARGE]}
  });

  var clearButton = page.append("Button", {
    text: "Clear",
    layoutData: {left: [66.6, MARGIN], right: MARGIN, top: [storeText, MARGIN_LARGE]}
  });

  var storeLabel = page.append("Label", {
    layoutData: {left: MARGIN, top: [addButton, MARGIN_LARGE], right: MARGIN},
    markupEnabled: true
  });

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

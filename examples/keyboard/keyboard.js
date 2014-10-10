tabris.load(function() {

  var page = tabris.createPage({
    title: "Keyboard Types",
    topLevel: true
  });

  var composite = page.append("ScrollComposite", {
    scroll: "vertical",
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var capitalizeOnLabel = composite.append("Label", {
    layoutData: {left: 10, top: 10, width: 120},
    alignment: "left",
    text: "Capitalize On"
  });

  var capitalizeOnInput = composite.append("Text", {
    layoutData: {left: [capitalizeOnLabel, 10], right: 10, top: 10},
    data: {
      "autoCapitalize": true
    }
  });

  var capitalizeOffLabel = composite.append("Label", {
    layoutData: {left: 10, top: [capitalizeOnInput, 10], width: 120},
    alignment: "left",
    text: "Capitalize Off"
  });

  var capitalizeOffInput = composite.append("Text", {
    layoutData: {left: [capitalizeOffLabel, 10], right: 10, top: [capitalizeOnInput, 10]},
    data: {
      "autoCapitalize": false
    }
  });

  var autoCorrectOnLabel = composite.append("Label", {
    layoutData: {left: 10, top: [capitalizeOffInput, 10], width: 120},
    alignment: "left",
    text: "AutoCorrect On"
  });

  var autoCorrectOnInput = composite.append("Text", {
    layoutData: {left: [autoCorrectOnLabel, 10], right: 10, top: [capitalizeOffInput, 10]},
    data: {
      "autoCorrect": true
    }
  });

  var autoCorrectOffLabel = composite.append("Label", {
    layoutData: {left: 10, top: [autoCorrectOnInput, 10], width: 120},
    alignment: "left",
    text: "AutoCorrect Off"
  });

  var autoCorrectOffInput = composite.append("Text", {
    layoutData: {left: [autoCorrectOffLabel, 10], right: 10, top: [autoCorrectOnInput, 10]},
    data: {
      "autoCorrect": false
    }
  });

  var asciiLabel = composite.append("Label", {
    layoutData: {left: 10, top: [autoCorrectOffInput, 10], width: 120},
    alignment: "left",
    text: "ASCII"
  });

  var asciiInput = composite.append("Text", {
    layoutData: {left: [asciiLabel, 10], right: 10, top: [autoCorrectOffInput, 10]},
    data: {
      "keyboard": "ascii"
    }
  });

  var decimalLabel = composite.append("Label", {
    layoutData: {left: 10, top: [asciiInput, 10], width: 120},
    alignment: "left",
    text: "Decimal"
  });

  var decimalInput = composite.append("Text", {
    layoutData: {left: [decimalLabel, 10], right: 10, top: [asciiInput, 10]},
    data: {
      "keyboard": "decimal"
    }
  });

  var emailLabel = composite.append("Label", {
    layoutData: {left: 10, top: [decimalInput, 10], width: 120},
    alignment: "left",
    text: "E-Mail"
  });

  var emailInput = composite.append("Text", {
    layoutData: {left: [emailLabel, 10], right: 10, top: [decimalInput, 10]},
    data: {
      "keyboard": "email"
    }
  });

  var numbersLabel = composite.append("Label", {
    layoutData: {left: 10, top: [emailInput, 10], width: 120},
    alignment: "left",
    text: "Numbers"
  });

  var numbersInput = composite.append("Text", {
    layoutData: {left: [numbersLabel, 10], right: 10, top: [emailInput, 10]},
    data: {
      "keyboard": "number"
    }
  });

  var numbersPunctuationLabel = composite.append("Label", {
    layoutData: {left: 10, top: [numbersInput, 10], width: 120},
    alignment: "left",
    text: "Numbers\nPunctuation"
  });

  var numbersPunctuationInput = composite.append("Text", {
    layoutData: {left: [numbersPunctuationLabel, 10], right: 10, top: [numbersInput, 10]},
    data: {
      "keyboard": "numbersAndPunctuation"
    }
  });

  var phoneLabel = composite.append("Label", {
    layoutData: {left: 10, top: [numbersPunctuationInput, 10], width: 120},
    alignment: "left",
    text: "Phone"
  });

  var phoneInput = composite.append("Text", {
    layoutData: {left: [phoneLabel, 10], right: 10, top: [numbersPunctuationInput, 10]},
    data: {
      "keyboard": "phone"
    }
  });

  var urlLabel = composite.append("Label", {
    layoutData: {left: 10, top: [phoneInput, 10], width: 120},
    alignment: "left",
    text: "URL"
  });

  composite.append("Text", {
    layoutData: {left: [urlLabel, 10], right: 10, top: [phoneInput, 10]},
    keyboard: "url"
  });

  page.open();

});
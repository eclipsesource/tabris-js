tabris.load(function() {

  var page = tabris.create("Page", {
    title: "Keyboard Types",
    topLevel: true
  });

  var composite = tabris.create("ScrollComposite", {
    scroll: "vertical",
    layoutData: {left: 0, right: 0, top: 0, bottom: 0}
  });

  var capitalizeOnLabel = tabris.create("Label", {
    layoutData: {left: 10, top: 10, width: 120},
    alignment: "left",
    text: "Capitalize On"
  });

  var capitalizeOnInput = tabris.create("Text", {
    layoutData: {left: [capitalizeOnLabel, 10], right: 10, top: 10},
    data: {
      autoCapitalize: true
    }
  });

  var capitalizeOffLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [capitalizeOnInput, 10], width: 120},
    alignment: "left",
    text: "Capitalize Off"
  });

  var capitalizeOffInput = tabris.create("Text", {
    layoutData: {left: [capitalizeOffLabel, 10], right: 10, top: [capitalizeOnInput, 10]},
    data: {
      autoCapitalize: false
    }
  });

  var autoCorrectOnLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [capitalizeOffInput, 10], width: 120},
    alignment: "left",
    text: "AutoCorrect On"
  });

  var autoCorrectOnInput = tabris.create("Text", {
    layoutData: {left: [autoCorrectOnLabel, 10], right: 10, top: [capitalizeOffInput, 10]},
    data: {
      autoCorrect: true
    }
  });

  var autoCorrectOffLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [autoCorrectOnInput, 10], width: 120},
    alignment: "left",
    text: "AutoCorrect Off"
  });

  var autoCorrectOffInput = tabris.create("Text", {
    layoutData: {left: [autoCorrectOffLabel, 10], right: 10, top: [autoCorrectOnInput, 10]},
    data: {
      autoCorrect: false
    }
  });

  var asciiLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [autoCorrectOffInput, 10], width: 120},
    alignment: "left",
    text: "ASCII"
  });

  var asciiInput = tabris.create("Text", {
    layoutData: {left: [asciiLabel, 10], right: 10, top: [autoCorrectOffInput, 10]},
    data: {
      keyboard: "ascii"
    }
  });

  var decimalLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [asciiInput, 10], width: 120},
    alignment: "left",
    text: "Decimal"
  });

  var decimalInput = tabris.create("Text", {
    layoutData: {left: [decimalLabel, 10], right: 10, top: [asciiInput, 10]},
    data: {
      keyboard: "decimal"
    }
  });

  var emailLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [decimalInput, 10], width: 120},
    alignment: "left",
    text: "E-Mail"
  });

  var emailInput = tabris.create("Text", {
    layoutData: {left: [emailLabel, 10], right: 10, top: [decimalInput, 10]},
    data: {
      keyboard: "email"
    }
  });

  var numbersLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [emailInput, 10], width: 120},
    alignment: "left",
    text: "Numbers"
  });

  var numbersInput = tabris.create("Text", {
    layoutData: {left: [numbersLabel, 10], right: 10, top: [emailInput, 10]},
    data: {
      keyboard: "number"
    }
  });

  var numbersPunctuationLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [numbersInput, 10], width: 120},
    alignment: "left",
    text: "Numbers\nPunctuation"
  });

  var numbersPunctuationInput = tabris.create("Text", {
    layoutData: {left: [numbersPunctuationLabel, 10], right: 10, top: [numbersInput, 10]},
    data: {
      keyboard: "numbersAndPunctuation"
    }
  });

  var phoneLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [numbersPunctuationInput, 10], width: 120},
    alignment: "left",
    text: "Phone"
  });

  var phoneInput = tabris.create("Text", {
    layoutData: {left: [phoneLabel, 10], right: 10, top: [numbersPunctuationInput, 10]},
    data: {
      keyboard: "phone"
    }
  });

  var urlLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [phoneInput, 10], width: 120},
    alignment: "left",
    text: "URL"
  });

  var urlInput = tabris.create("Text", {
    layoutData: {left: [urlLabel, 10], right: 10, top: [phoneInput, 10]},
    keyboard: "url"
  });

  composite.append(capitalizeOnLabel, capitalizeOnInput, capitalizeOffLabel, capitalizeOffInput,
    autoCorrectOnLabel, autoCorrectOnInput, autoCorrectOffLabel, autoCorrectOffInput, asciiLabel,
    asciiInput, decimalLabel, decimalInput, emailLabel, emailInput, numbersLabel, numbersInput,
    numbersPunctuationLabel, numbersPunctuationInput, phoneLabel, phoneInput, urlLabel, urlInput);
  page.append(composite);

  page.open();

});

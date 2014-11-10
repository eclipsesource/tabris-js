tabris.registerWidget("DateTime", {
  _type: "rwt.widgets.DateTime",
  _checkProperty: {year: true, month: true, day: true}
});

tabris.load(function() {

  var message;

  var page = tabris.create("Page", {
    title: "Oceanic Flight 815 Booking",
    topLevel: true
  });

  var firstNameLabel = tabris.create("Label", {
    layoutData: {left: 10, top: 18, width: 120},
    alignment: "left",
    text: "First Name:"
  }).appendTo(page);

  var firstNameInput = tabris.create("Text", {
    layoutData: {left: [firstNameLabel, 10], right: 10, baseline: firstNameLabel},
    message: "First Name"
  }).appendTo(page);

  var lastNameLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [firstNameLabel, 18], width: 120},
    alignment: "left",
    text: "Last Name:"
  }).appendTo(page);

  var lastNameInput = tabris.create("Text", {
    layoutData: {left: [lastNameLabel, 10], right: 10, baseline: lastNameLabel},
    message: "Last Name"
  }).appendTo(page);

  var passphraseLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [lastNameLabel, 18], width: 120},
    alignment: "left",
    text: "Passphrase:"
  }).appendTo(page);

  tabris.create("Text", {
    type: "password",
    layoutData: {left: [passphraseLabel, 10], right: 10, baseline: passphraseLabel},
    message: "Passphrase"
  }).appendTo(page);

  var countryLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [passphraseLabel, 18], width: 120},
    alignment: "left",
    text: "Country:"
  }).appendTo(page);

  tabris.create("Combo", {
    layoutData: {left: [countryLabel, 10], right: 10, baseline: countryLabel},
    items: ["Germany", "Canada", "USA", "Bulgaria"],
    selectionIndex: 0
  }).appendTo(page);

  var classLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [countryLabel, 18], width: 120},
    alignment: "left",
    text: "Class:"
  }).appendTo(page);

  tabris.create("Combo", {
    layoutData: {left: [classLabel, 10], right: 10, baseline: classLabel},
    items: ["Business", "Economy", "Economy Plus"],
    selectionIndex: 0
  }).appendTo(page);

  var dateLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [classLabel, 18], width: 120},
    alignment: "left",
    text: "Date:"
  }).appendTo(page);

  var current = new Date();
  var dateField = tabris.create("DateTime", {
    style: ["DATE"],
    layoutData: {left: [dateLabel, 10], right: 10, baseline: dateLabel},
    year: current.getFullYear(),
    month: current.getMonth(),
    day: current.getDate()
  }).appendTo(page);

  var luggageLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [dateLabel, 18], width: 120},
    alignment: "left",
    text: "Luggage:"
  }).appendTo(page);

  var luggageWeight = tabris.create("Label", {
    layoutData: {right: 10, baseline: luggageLabel, width: 50},
    alignment: "left",
    text: "0 Kg"
  }).appendTo(page);

  var luggage = tabris.create("Slider", {
    layoutData: {left: [luggageLabel, 10], right: [luggageWeight, 10], top: [dateLabel, 18]}
  }).on("change:selection", function() {
    luggageWeight.set("text", this.get("selection") + " Kg");
  }).appendTo(page);

  var checkbox = tabris.create("CheckBox", {
    layoutData: {left: [dateLabel, 10], right: 10, top: [luggage, 10]},
    text: "Vegetarian"
  }).appendTo(page);

  var button = tabris.create("Button", {
    layoutData: {left: 10, right: 10, top: [checkbox, 18]},
    text: "Place Reservation",
    background: "#8b0000",
    foreground: "white"
  }).on("selection", function() {
    populateMessage();
  }).appendTo(page);

  function populateMessage() {
    if (message) {
      message.dispose();
    }
    message = tabris.create("Label", {
      layoutData: {left: 10, right: 10, top: [button, 10]},
      alignment: "left",
      text: "Flight booked for: " + createName() + "\n" + "Departure: " + createDepartureDate()
    }).appendTo(page);
  }

  function createName() {
    return [firstNameInput.get("text"), lastNameInput.get("text")].join(" ");
  }

  function createDepartureDate() {
    return [dateField.get("year"), (dateField.get("month") + 1), dateField.get("day")].join("/");
  }

  page.open();

});

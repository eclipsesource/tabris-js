tabris.load(function() {

  var message;

  var page = tabris.create("Page", {
    title: "Oceanic Flight 815 Booking",
    topLevel: true
  });

  var firstNameLabel = tabris.create("Label", {
    layoutData: {left: 10, top: 10, width: 120},
    alignment: "left",
    text: "First Name:"
  }).appendTo(page);

  var firstNameInput = tabris.create("Text", {
    layoutData: {left: [firstNameLabel, 10], right: 10, top: 10},
    message: "First Name"
  }).appendTo(page);

  var lastNameLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [firstNameInput, 10], width: 120},
    alignment: "left",
    text: "Last Name:"
  }).appendTo(page);

  var lastNameInput = tabris.create("Text", {
    layoutData: {left: [lastNameLabel, 10], right: 10, top: [firstNameInput, 10]},
    message: "Last Name"
  }).appendTo(page);

  var passphraseLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [lastNameInput, 10], width: 120},
    alignment: "left",
    text: "Passphrase:"
  }).appendTo(page);

  var passphraseInput = tabris.create("Text", {
    type: "password",
    layoutData: {left: [passphraseLabel, 10], right: 10, top: [lastNameInput, 10]},
    message: "Passphrase"
  }).appendTo(page);

  var countryLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [passphraseInput, 10], width: 120},
    alignment: "left",
    text: "Country:"
  }).appendTo(page);

  var countryCombo = tabris.create("Combo", {
    layoutData: {left: [countryLabel, 10], right: 10, top: [passphraseInput, 10]},
    items: ["Germany", "Canada", "USA", "Bulgaria"],
    selectionIndex: 0
  }).appendTo(page);

  var classLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [countryCombo, 10], width: 120},
    alignment: "left",
    text: "Class:"
  }).appendTo(page);

  var classCombo = tabris.create("Combo", {
    layoutData: {left: [classLabel, 10], right: 10, top: [countryCombo, 10]},
    items: ["Business", "Economy", "Economy Plus"],
    selectionIndex: 0
  }).appendTo(page);

  var dateTimeLabel = tabris.create("Label", {
    layoutData: {left: 10, top: [classCombo, 10], width: 120},
    alignment: "left",
    text: "Date:"
  }).appendTo(page);

  var dateTime = tabris.create("DateTime", {
    style: ["DATE"],
    layoutData: {left: [dateTimeLabel, 10], right: 10, top: [classCombo, 10]},
    year: 2014,
    day: 20,
    month: 5
  }).appendTo(page);

  var checkbox = tabris.create("CheckBox", {
    layoutData: {left: [dateTimeLabel, 10], right: 10, top: [dateTime, 10]},
    text: "Vegetarian"
  }).appendTo(page);

  var button = tabris.create("Button", {
    layoutData: {left: 10, right: 10, top: [checkbox, 20]},
    text: "Place Reservation",
    background: "#8b0000",
    foreground: "white"
  }).on("selection", function() {
    populateMessage();
  }).appendTo(page);

  function populateMessage() {
console.log("populate");
    if (message) {
console.log("dispose");
      message.dispose();
    }
console.log("message",
    message = tabris.create("Label", {
      layoutData: {left: 10, right: 10, top: [button, 10]},
      alignment: "left",
      text: "Flight booked for: " + createName() + "\n" + "Departure: " + createDepartureDate()
    }).appendTo(page)
);
  }

  function createName() {
    return [firstNameInput.get("text"), lastNameInput.get("text")].join(" ");
  }

  function createDepartureDate() {
    return [dateTime.get("year"), (dateTime.get("month") + 1), dateTime.get("day")].join("/");
  }

  page.open();

});

var message;

var page = tabris.create("Page", {
  title: "Oceanic Flight 815 Booking",
  topLevel: true
});

var firstNameTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: 18, width: 120},
  alignment: "left",
  text: "First Name:"
}).appendTo(page);

var firstNameInput = tabris.create("TextInput", {
  layoutData: {left: [firstNameTextView, 10], right: 10, baseline: firstNameTextView},
  message: "First Name"
}).appendTo(page);

var lastNameTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [firstNameTextView, 18], width: 120},
  alignment: "left",
  text: "Last Name:"
}).appendTo(page);

var lastNameInput = tabris.create("TextInput", {
  layoutData: {left: [lastNameTextView, 10], right: 10, baseline: lastNameTextView},
  message: "Last Name"
}).appendTo(page);

var passphraseTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [lastNameTextView, 18], width: 120},
  alignment: "left",
  text: "Passphrase:"
}).appendTo(page);

tabris.create("TextInput", {
  type: "password",
  layoutData: {left: [passphraseTextView, 10], right: 10, baseline: passphraseTextView},
  message: "Passphrase"
}).appendTo(page);

var countryTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [passphraseTextView, 18], width: 120},
  alignment: "left",
  text: "Country:"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {left: [countryTextView, 10], right: 10, baseline: countryTextView},
  items: ["Germany", "Canada", "USA", "Bulgaria"],
  selectionIndex: 0
}).appendTo(page);

var classTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [countryTextView, 18], width: 120},
  alignment: "left",
  text: "Class:"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {left: [classTextView, 10], right: 10, baseline: classTextView},
  items: ["Business", "Economy", "Economy Plus"],
  selectionIndex: 0
}).appendTo(page);

var luggageTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [classTextView, 18], width: 120},
  alignment: "left",
  text: "Luggage:"
}).appendTo(page);

var luggageWeight = tabris.create("TextView", {
  layoutData: {right: 10, baseline: luggageTextView, width: 50},
  alignment: "left",
  text: "0 Kg"
}).appendTo(page);

var luggage = tabris.create("Slider", {
  layoutData: {left: [luggageTextView, 10], right: [luggageWeight, 10], top: [classTextView, 18]}
}).on("change:selection", function() {
  luggageWeight.set("text", this.get("selection") + " Kg");
}).appendTo(page);

var checkbox = tabris.create("CheckBox", {
  layoutData: {left: [classTextView, 10], right: 10, top: [luggage, 10]},
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
  message = tabris.create("TextView", {
    layoutData: {left: 10, right: 10, top: [button, 10]},
    alignment: "left",
    text: "Flight booked for: " + createName() + "\n"
  }).appendTo(page);
}

function createName() {
  return [firstNameInput.get("text"), lastNameInput.get("text")].join(" ");
}

page.open();

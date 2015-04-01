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
  text: "Last Name:"
}).appendTo(page);

var lastNameInput = tabris.create("TextInput", {
  layoutData: {left: [lastNameTextView, 10], right: 10, baseline: lastNameTextView},
  message: "Last Name"
}).appendTo(page);

var passphraseTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [lastNameTextView, 18], width: 120},
  text: "Passphrase:"
}).appendTo(page);

tabris.create("TextInput", {
  type: "password",
  layoutData: {left: [passphraseTextView, 10], right: 10, baseline: passphraseTextView},
  message: "Passphrase"
}).appendTo(page);

var countryTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [passphraseTextView, 18], width: 120},
  text: "Country:"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {left: [countryTextView, 10], right: 10, baseline: countryTextView},
  items: ["Germany", "Canada", "USA", "Bulgaria"]
}).appendTo(page);

var classTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [countryTextView, 18], width: 120},
  text: "Class:"
}).appendTo(page);

tabris.create("Picker", {
  layoutData: {left: [classTextView, 10], right: 10, baseline: classTextView},
  items: ["Business", "Economy", "Economy Plus"]
}).appendTo(page);

var seatTextView = tabris.create("TextView", {
  layoutData: {left: 10, top: [classTextView, 18], width: 120},
  text: "Seat:"
}).appendTo(page);

var windowButton = tabris.create("RadioButton", {
  layoutData: {left: [seatTextView, 10], right: 10, baseline: seatTextView},
  text: "Window"
}).appendTo(page);

var aisleButton = tabris.create("RadioButton", {
  layoutData: {left: [seatTextView, 10], right: 10, top: [seatTextView, 10]},
  text: "Aisle"
}).appendTo(page);

var dontCareButton = tabris.create("RadioButton", {
  layoutData: {left: [seatTextView, 10], right: 10, top: [aisleButton, 10]},
  text: "Don't care",
  selection: true
}).appendTo(page);

var luggagePanel = tabris.create("Composite", {
  layoutData: {left: 10, top: [dontCareButton, 18], right: 10}
}).appendTo(page);

var luggageTextView = tabris.create("TextView", {
  layoutData: {left: 0, centerY: 0, width: 120},
  text: "Luggage:"
}).appendTo(luggagePanel);

var luggageWeight = tabris.create("TextView", {
  layoutData: {right: 10, centerY: 0, width: 50},
  text: "0 Kg"
}).appendTo(luggagePanel);

tabris.create("Slider", {
  layoutData: {left: [luggageTextView, 10], right: [luggageWeight, 10], centerY: 0}
}).on("change:selection", function() {
  luggageWeight.set("text", this.get("selection") + " Kg");
}).appendTo(luggagePanel);

var checkbox = tabris.create("CheckBox", {
  layoutData: {left: [seatTextView, 10], right: 10, top: [luggagePanel, 10]},
  text: "Vegetarian"
}).appendTo(page);

var button = tabris.create("Button", {
  layoutData: {left: 10, right: 10, top: [checkbox, 18]},
  text: "Place Reservation",
  background: "#8b0000",
  foreground: "white"
}).on("select", function() {
  populateMessage();
}).appendTo(page);

function populateMessage() {
  if (message) {
    message.dispose();
  }
  message = tabris.create("TextView", {
    layoutData: {left: 10, right: 10, top: [button, 10]},
    text: "Flight booked for: " + createName() + "\nSeating: " + createSeating()
  }).appendTo(page);
}

function createName() {
  return [firstNameInput.get("text"), lastNameInput.get("text")].join(" ");
}

function createSeating() {
  var seating = "Anywhere";
  [windowButton, aisleButton].forEach(function(button) {
    if (button.get("selection")) {
      seating = button.get("text");
    }
  });
  return seating;
}

page.open();

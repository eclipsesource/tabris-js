var message;

var page = tabris.create("Page", {
  title: "Oceanic Flight 815 Booking",
  topLevel: true
});

tabris.create("TextView", {
  id: "firstNameLabel",
  alignment: "left",
  text: "First Name:"
}).appendTo(page);

tabris.create("TextInput", {
  id: "firstNameInput",
  message: "First Name"
}).appendTo(page);

tabris.create("TextView", {
  id: "lastNameLabel",
  text: "Last Name:"
}).appendTo(page);

tabris.create("TextInput", {
  id: "lastNameInput",
  message: "Last Name"
}).appendTo(page);

tabris.create("TextView", {
  id: "passphraseLabel",
  text: "Passphrase:"
}).appendTo(page);

tabris.create("TextInput", {
  id: "passphraseInput",
  type: "password",
  message: "Passphrase"
}).appendTo(page);

tabris.create("TextView", {
  id: "countryLabel",
  text: "Country:"
}).appendTo(page);

tabris.create("Picker", {
  id: "countryPicker",
  items: ["Germany", "Canada", "USA", "Bulgaria"]
}).appendTo(page);

tabris.create("TextView", {
  id: "classLabel",
  text: "Class:"
}).appendTo(page);

tabris.create("Picker", {
  id: "classPicker",
  items: ["Business", "Economy", "Economy Plus"]
}).appendTo(page);

tabris.create("TextView", {
  id: "seatLabel",
  text: "Seat:"
}).appendTo(page);

tabris.create("RadioButton", {
  id: "window",
  text: "Window"
}).appendTo(page);

tabris.create("RadioButton", {
  id: "aisle",
  text: "Aisle"
}).appendTo(page);

tabris.create("RadioButton", {
  id: "dontCareButton",
  text: "Don't care",
  selection: true
}).appendTo(page);

tabris.create("Composite", {
  id: "luggagePanel"
}).append(
  tabris.create("TextView", {
    id: "luggageLabel",
    text: "Luggage:"
  })
).append(
  tabris.create("TextView", {
    id: "luggageWeight",
    text: "0 Kg"
  })
).append(
  tabris.create("Slider", {
    id: "luggageSlider"
  }).on("change:selection", function(widget, selection) {
    page.find("#luggageWeight").set("text", selection + " Kg");
  })
).appendTo(page);

tabris.create("CheckBox", {
  id: "veggie",
  text: "Vegetarian"
}).appendTo(page);

tabris.create("Composite", {
  id: "milesPanel"
}).append(
  tabris.create("TextView", {
    id: "milesLabel",
    text: "Redeem miles:"
  })
).append(
  tabris.create("Switch", {
    id: "milesSwitch"
  })
).appendTo(page);

tabris.create("Button", {
  id: "done",
  text: "Place Reservation",
  background: "#8b0000",
  textColor: "white"
}).on("select", function() {
  populateMessage();
}).appendTo(page);

page.apply({
  "#firstNameLabel": {layoutData: {left: 10, top: 18, width: 120}},
  "#firstNameInput": {layoutData: {left: "#firstNameLabel 10", right: 10, baseline: "#firstNameLabel"}},
  "#lastNameLabel": {layoutData: {left: 10, top: "#firstNameLabel 18", width: 120}},
  "#lastNameInput": {layoutData: {left: "#lastNameLabel 10", right: 10, baseline: "#lastNameLabel"}},
  "#passphraseLabel": {layoutData: {left: 10, top: "#lastNameLabel 18", width: 120}},
  "#passphraseInput": {layoutData: {left: "#passphraseLabel 10", right: 10, baseline: "#passphraseLabel"}},
  "#countryLabel": {layoutData: {left: 10, top: "#passphraseLabel 18", width: 120}},
  "#countryPicker": {layoutData: {left: "#countryLabel 10", right: 10, baseline: "#countryLabel"}},
  "#seatLabel": {layoutData: {left: 10, top: "#classLabel 18", width: 120}},
  "#window": {layoutData: {left: "#seatLabel 10", right: 10, baseline: "#seatLabel"}},
  "#aisle": {layoutData: {left: "#seatLabel 10", right: 10, top: "#seatLabel 10"}},
  "#classLabel": {layoutData: {left: 10, top: "#countryLabel 18", width: 120}},
  "#classPicker": {layoutData: {left: "#classLabel 10", right: 10, baseline: "#classLabel"}},
  "#dontCareButton": {layoutData: {left: "#seatLabel 10", right: 10, top: "#aisle 10"}},
  "#luggagePanel": {layoutData: {left: 10, top: "#dontCareButton 18", right: 10}},
  "#luggageLabel": {layoutData: {left: 0, centerY: 0, width: 120}},
  "#luggageWeight": {layoutData: {right: 10, centerY: 0, width: 50}},
  "#luggageSlider": {layoutData: {left: "#luggageLabel 10", right: "#luggageWeight 10", centerY: 0}},
  "#veggie": {layoutData: {left: "#seatLabel 10", right: 10, top: "#luggagePanel 10"}},
  "#milesPanel": {layoutData: {left: 10, top: "#veggie 10", right: 10}},
  "#milesLabel": {layoutData: {left: 0, centerY: 0, width: 120}},
  "#milesSwitch": {layoutData: {left: "#milesLabel 10", centerY: 0}},
  "#done": {layoutData: {left: 10, right: 10, top: "#milesPanel 18"}}
});

function populateMessage() {
  if (message) {
    message.dispose();
  }
  message = tabris.create("TextView", {
    layoutData: {left: 10, right: 10, top: "#done 10"},
    text: "Flight booked for: " + createName() + "\nSeating: " + createSeating()
  }).appendTo(page);
}

function createName() {
  return [page.children("#firstNameInput").get("text"), page.children("#lastNameInput").get("text")].join(" ");
}

function createSeating() {
  var seating = "Anywhere";
  page.children("RadioButton").forEach(function(button) {
    if (button.get("selection")) {
      seating = button.get("text");
    }
  });
  return seating;
}

page.open();

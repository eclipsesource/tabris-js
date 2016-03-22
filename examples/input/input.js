var message;

var page = new tabris.Page({
  title: "Oceanic Flight 815 Booking",
  topLevel: true
});

var scrollView = new tabris.ScrollView().appendTo(page);

new tabris.TextView({
  id: "nameLabel",
  alignment: "left",
  text: "Name:"
}).appendTo(scrollView);

new tabris.TextInput({
  id: "nameInput",
  message: "First Name"
}).appendTo(scrollView);

new tabris.TextView({
  id: "flyerNumberLabel",
  text: "Flyer Number:"
}).appendTo(scrollView);

new tabris.TextInput({
  id: "flyerNumberInput",
  keyboard: "number",
  message: "Flyer Number"
}).appendTo(scrollView);

new tabris.TextView({
  id: "passphraseLabel",
  text: "Passphrase:"
}).appendTo(scrollView);

new tabris.TextInput({
  id: "passphraseInput",
  type: "password",
  message: "Passphrase"
}).appendTo(scrollView);

new tabris.TextView({
  id: "countryLabel",
  text: "Country:"
}).appendTo(scrollView);

new tabris.Picker({
  id: "countryPicker",
  items: ["Germany", "Canada", "USA", "Bulgaria"]
}).appendTo(scrollView);

new tabris.TextView({
  id: "classLabel",
  text: "Class:"
}).appendTo(scrollView);

new tabris.Picker({
  id: "classPicker",
  items: ["Business", "Economy", "Economy Plus"]
}).appendTo(scrollView);

new tabris.TextView({
  id: "seatLabel",
  text: "Seat:"
}).appendTo(scrollView);

new tabris.RadioButton({
  id: "window",
  text: "Window"
}).appendTo(scrollView);

new tabris.RadioButton({
  id: "aisle",
  text: "Aisle"
}).appendTo(scrollView);

new tabris.RadioButton({
  id: "dontCareButton",
  text: "Don't care",
  selection: true
}).appendTo(scrollView);

new tabris.Composite({
  id: "luggagePanel"
}).append(
    new tabris.TextView({
    id: "luggageLabel",
    text: "Luggage:"
  })
).append(
    new tabris.TextView({
    id: "luggageWeight",
    text: "0 Kg"
  })
).append(
    new tabris.Slider({
    id: "luggageSlider"
  }).on("change:selection", function(widget, selection) {
    scrollView.find("#luggageWeight").set("text", selection + " Kg");
  })
).appendTo(scrollView);

new tabris.CheckBox({
  id: "veggie",
  text: "Vegetarian"
}).appendTo(scrollView);

new tabris.Composite({
  id: "milesPanel"
}).append(
    new tabris.TextView({
    id: "milesLabel",
    text: "Redeem miles:"
  })
).append(
    new tabris.Switch({
    id: "milesSwitch"
  })
).appendTo(scrollView);

new tabris.Button({
  id: "done",
  text: "Place Reservation",
  background: "#8b0000",
  textColor: "white"
}).on("select", function() {
  populateMessage();
}).appendTo(scrollView);

scrollView.apply({
  "#nameLabel": {layoutData: {left: 10, top: 18, width: 120}},
  "#nameInput": {layoutData: {left: "#nameLabel 10", right: 10, baseline: "#nameLabel"}},
  "#flyerNumberLabel": {layoutData: {left: 10, top: "#nameLabel 18", width: 120}},
  "#flyerNumberInput": {layoutData: {left: "#flyerNumberLabel 10", right: 10, baseline: "#flyerNumberLabel"}},
  "#passphraseLabel": {layoutData: {left: 10, top: "#flyerNumberLabel 18", width: 120}},
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
  message = new tabris.TextView({
    layoutData: {left: 10, right: 10, top: "#done 10", bottom: 10},
    text: [
      "Flight booked for: " + scrollView.children("#nameInput").get("text"),
      "Desitnation: " + scrollView.children("#countryPicker").get("selection"),
      "Seating: " + createSeating(),
      "Luggage: " + createWeight(),
      "Meal: " + createMeal(),
      "Redeem miles: " + createFrequentFlyerInfo()
    ].join("\n")
  }).appendTo(scrollView);
}

function createSeating() {
  var seating = "Anywhere";
  scrollView.children("RadioButton").forEach(function(button) {
    if (button.get("selection")) {
      seating = button.get("text");
    }
  });
  seating += ", " + scrollView.children("#classPicker").get("selection");
  return seating;
}

function createWeight() {
  var panel = scrollView.children("#luggagePanel");
  return panel.children("#luggageSlider").get("selection") + " Kg";
}

function createMeal() {
  return scrollView.children("#veggie").get("selection") ? "Vegitarian" : "Standard";
}

function createFrequentFlyerInfo() {
  var panel = scrollView.children("#milesPanel");
  var info = panel.children("#milesSwitch").get("selection") ? "Yes" : "No";
  info += ", acct: " + scrollView.children("#flyerNumberInput").get("text");
  return info;
}

page.open();

const {
  Button, CheckBox, Composite, TextView, TextInput, Picker, RadioButton, ScrollView, Slider, Switch, ui
} = require('tabris');

let scrollView = new ScrollView({left: 0, top: 0, right: 0, bottom: 0}).appendTo(ui.contentView);

const COUNTRIES = ['Germany', 'Canada', 'USA', 'Bulgaria'];
const CLASSES = ['Business', 'Economy', 'Economy Plus'];

new TextView({
  id: 'nameLabel',
  alignment: 'left',
  text: 'Name:'
}).appendTo(scrollView);

new TextInput({
  id: 'nameInput',
  message: 'Full Name'
}).appendTo(scrollView);

new TextView({
  id: 'flyerNumberLabel',
  text: 'Flyer Number:'
}).appendTo(scrollView);

new TextInput({
  id: 'flyerNumberInput',
  keyboard: 'number',
  message: 'Flyer Number'
}).appendTo(scrollView);

new TextView({
  id: 'passphraseLabel',
  text: 'Passphrase:'
}).appendTo(scrollView);

new TextInput({
  id: 'passphraseInput',
  type: 'password',
  message: 'Passphrase'
}).appendTo(scrollView);

new TextView({
  id: 'countryLabel',
  text: 'Country:'
}).appendTo(scrollView);

new Picker({
  id: 'countryPicker',
  itemCount: COUNTRIES.length,
  itemText: index => COUNTRIES[index]
}).appendTo(scrollView);

new TextView({
  id: 'classLabel',
  text: 'Class:'
}).appendTo(scrollView);

new Picker({
  id: 'classPicker',
  itemCount: CLASSES.length,
  itemText: index => CLASSES[index]
}).appendTo(scrollView);

new TextView({
  id: 'seatLabel',
  text: 'Seat:'
}).appendTo(scrollView);

new RadioButton({
  id: 'windowSeat',
  text: 'Window'
}).appendTo(scrollView);

new RadioButton({
  id: 'aisleSeat',
  text: 'Aisle'
}).appendTo(scrollView);

new RadioButton({
  id: 'anySeat',
  text: "Don't care",
  checked: true
}).appendTo(scrollView);

new Composite({
  id: 'luggagePanel'
}).append(
  new TextView({
    id: 'luggageLabel',
    text: 'Luggage:'
  })
).append(
  new TextView({
    id: 'luggageWeight',
    text: '0 Kg'
  })
).append(
  new Slider({
    id: 'luggageSlider'
  }).on('selectionChanged', ({value}) => {
    scrollView.find('#luggageWeight').set('text', value + ' Kg');
  })
).appendTo(scrollView);

new CheckBox({
  id: 'veggieChoice',
  text: 'Vegetarian'
}).appendTo(scrollView);

new Composite({
  id: 'milesPanel'
}).append(
  new TextView({
    id: 'milesLabel',
    text: 'Redeem miles:'
  })
).append(
  new Switch({
    id: 'milesSwitch'
  })
).appendTo(scrollView);

new Button({
  id: 'reservationButton',
  text: 'Place Reservation',
  background: '#8b0000',
  textColor: 'white'
}).on('select', () => {
  updateMessage();
}).appendTo(scrollView);

let message = new TextView({
  left: 10, right: 10, top: '#reservationButton 10'
}).appendTo(scrollView);

scrollView.apply({
  '#nameLabel': {left: 10, top: 18, width: 120},
  '#nameInput': {left: '#nameLabel 10', right: 10, baseline: '#nameLabel'},
  '#flyerNumberLabel': {left: 10, top: '#nameLabel 18', width: 120},
  '#flyerNumberInput': {left: '#flyerNumberLabel 10', right: 10, baseline: '#flyerNumberLabel'},
  '#passphraseLabel': {left: 10, top: '#flyerNumberLabel 18', width: 120},
  '#passphraseInput': {left: '#passphraseLabel 10', right: 10, baseline: '#passphraseLabel'},
  '#countryLabel': {left: 10, top: '#passphraseLabel 18', width: 120},
  '#countryPicker': {left: '#countryLabel 10', right: 10, baseline: '#countryLabel'},
  '#seatLabel': {left: 10, top: '#classLabel 18', width: 120},
  '#windowSeat': {left: '#seatLabel 10', right: 10, baseline: '#seatLabel'},
  '#aisleSeat': {left: '#seatLabel 10', right: 10, top: '#seatLabel 10'},
  '#classLabel': {left: 10, top: '#countryLabel 18', width: 120},
  '#classPicker': {left: '#classLabel 10', right: 10, baseline: '#classLabel'},
  '#anySeat': {left: '#seatLabel 10', right: 10, top: '#aisleSeat 10'},
  '#luggagePanel': {left: 10, top: '#anySeat 18', right: 10},
  '#luggageLabel': {left: 0, centerY: 0, width: 120},
  '#luggageWeight': {right: 10, centerY: 0, width: 50},
  '#luggageSlider': {left: '#luggageLabel 10', right: '#luggageWeight 10', centerY: 0},
  '#veggieChoice': {left: '#seatLabel 10', right: 10, top: '#luggagePanel 10'},
  '#milesPanel': {left: 10, top: '#veggieChoice 10', right: 10},
  '#milesLabel': {left: 0, centerY: 0, width: 120},
  '#milesSwitch': {left: '#milesLabel 10', centerY: 0},
  '#reservationButton': {left: 10, right: 10, top: '#milesPanel 18'}
});

function updateMessage() {
  message.text = [
    'Flight booked for: ' + scrollView.children('#nameInput').first().text,
    'Destination: ' + COUNTRIES[scrollView.children('#countryPicker').first().selectionIndex],
    'Seating: ' + createSeating(),
    'Luggage: ' + createWeight(),
    'Meal: ' + createMeal(),
    'Redeem miles: ' + createFrequentFlyerInfo()
  ].join('\n') + '\n';
}

function createSeating() {
  let seating = 'Anywhere';
  scrollView.children('RadioButton').forEach((button) => {
    if (button.checked) {
      seating = button.text;
    }
  });
  seating += ', ' + CLASSES[scrollView.children('#classPicker').first().selectionIndex];
  return seating;
}

function createWeight() {
  let panel = scrollView.children('#luggagePanel');
  return panel.children('#luggageSlider').first().selection + ' kg';
}

function createMeal() {
  return scrollView.children('#veggieChoice').first().checked ? 'Vegetarian' : 'Standard';
}

function createFrequentFlyerInfo() {
  let panel = scrollView.children('#milesPanel');
  let info = panel.children('#milesSwitch').first().checked ? 'Yes' : 'No';
  info += ', acct: ' + scrollView.children('#flyerNumberInput').first().text;
  return info;
}

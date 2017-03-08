var scrollView = new tabris.ScrollView({left: 0, top: 0, right: 0, bottom: 0}).appendTo(tabris.ui.contentView);

new tabris.TextView({
  id: 'nameLabel',
  alignment: 'left',
  text: 'Name:'
}).appendTo(scrollView);

new tabris.TextInput({
  id: 'nameInput',
  message: 'Full Name'
}).appendTo(scrollView);

new tabris.TextView({
  id: 'flyerNumberLabel',
  text: 'Flyer Number:'
}).appendTo(scrollView);

new tabris.TextInput({
  id: 'flyerNumberInput',
  keyboard: 'number',
  message: 'Flyer Number'
}).appendTo(scrollView);

new tabris.TextView({
  id: 'passphraseLabel',
  text: 'Passphrase:'
}).appendTo(scrollView);

new tabris.TextInput({
  id: 'passphraseInput',
  type: 'password',
  message: 'Passphrase'
}).appendTo(scrollView);

new tabris.TextView({
  id: 'countryLabel',
  text: 'Country:'
}).appendTo(scrollView);

new tabris.Picker({
  id: 'countryPicker',
  items: ['Germany', 'Canada', 'USA', 'Bulgaria']
}).appendTo(scrollView);

new tabris.TextView({
  id: 'classLabel',
  text: 'Class:'
}).appendTo(scrollView);

new tabris.Picker({
  id: 'classPicker',
  items: ['Business', 'Economy', 'Economy Plus']
}).appendTo(scrollView);

new tabris.TextView({
  id: 'seatLabel',
  text: 'Seat:'
}).appendTo(scrollView);

new tabris.RadioButton({
  id: 'windowSeat',
  text: 'Window'
}).appendTo(scrollView);

new tabris.RadioButton({
  id: 'aisleSeat',
  text: 'Aisle'
}).appendTo(scrollView);

new tabris.RadioButton({
  id: 'anySeat',
  text: "Don't care",
  checked: true
}).appendTo(scrollView);

new tabris.Composite({
  id: 'luggagePanel'
}).append(
  new tabris.TextView({
    id: 'luggageLabel',
    text: 'Luggage:'
  })
).append(
  new tabris.TextView({
    id: 'luggageWeight',
    text: '0 Kg'
  })
).append(
  new tabris.Slider({
    id: 'luggageSlider'
  }).on('change:selection', function({value}) {
    scrollView.find('#luggageWeight').set('text', value + ' Kg');
  })
).appendTo(scrollView);

new tabris.CheckBox({
  id: 'veggieChoice',
  text: 'Vegetarian'
}).appendTo(scrollView);

new tabris.Composite({
  id: 'milesPanel'
}).append(
  new tabris.TextView({
    id: 'milesLabel',
    text: 'Redeem miles:'
  })
).append(
  new tabris.Switch({
    id: 'milesSwitch'
  })
).appendTo(scrollView);

new tabris.Button({
  id: 'reservationButton',
  text: 'Place Reservation',
  background: '#8b0000',
  textColor: 'white'
}).on('select', function() {
  updateMessage();
}).appendTo(scrollView);

let message = new tabris.TextView({
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
    'Destination: ' + scrollView.children('#countryPicker').first().selection,
    'Seating: ' + createSeating(),
    'Luggage: ' + createWeight(),
    'Meal: ' + createMeal(),
    'Redeem miles: ' + createFrequentFlyerInfo()
  ].join('\n') + '\n';
}

function createSeating() {
  var seating = 'Anywhere';
  scrollView.children('RadioButton').forEach(function(button) {
    if (button.checked) {
      seating = button.text;
    }
  });
  seating += ', ' + scrollView.children('#classPicker').first().selection;
  return seating;
}

function createWeight() {
  var panel = scrollView.children('#luggagePanel');
  return panel.children('#luggageSlider').first().selection + ' Kg';
}

function createMeal() {
  return scrollView.children('#veggieChoice').checked ? 'Vegetarian' : 'Standard';
}

function createFrequentFlyerInfo() {
  var panel = scrollView.children('#milesPanel');
  var info = panel.children('#milesSwitch').first().checked ? 'Yes' : 'No';
  info += ', acct: ' + scrollView.children('#flyerNumberInput').first().text;
  return info;
}

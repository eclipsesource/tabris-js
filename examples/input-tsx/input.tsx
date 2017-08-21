import {Widget, ScrollView, Button, Slider, TextView, Picker, CheckBox, Switch, TextInput, ui} from 'tabris';

const COUNTRIES = ['Germany', 'Canada', 'USA', 'Bulgaria'];
const CLASSES = ['Business', 'Economy', 'Economy Plus'];

ui.contentView.append(
  <scrollView id='scrollView' class='stretch' direction='vertical'>
    <textView class='col1 label' alignment='left' text='Name:'/>
    <textInput class='col2 labeled' id='name' message='Full Name'/>
    <textView class='col1 label' text='Flyer Number:'/>
    <textInput class='col2 labeled' keyboard='number' message='Flyer Number'/>
    <textView class='col1 label' text='Passphrase:'/>
    <textInput class='col2 labeled' type='password' message='Passphrase'/>
    <textView class='col1 label' text='Country:'/>
    <picker class='col2 labeled' id='country' itemCount={COUNTRIES.length} itemText={index => COUNTRIES[index]}/>
    <textView class='col1 label' text='Class:'/>
    <picker class='col2 labeled' id='class' itemCount={CLASSES.length} itemText={index => CLASSES[index]}/>
    <textView class='col1 label' text='Seat:'/>
    <radioButton class='col2 labeled' text='Window'/>
    <radioButton class='col2 stacked' text='Aisle'/>
    <radioButton class='col2 stacked' text="Don't care" checked={true} />
    <composite class='group'>
      <textView class='col1 grouped' text='Luggage:'/>
      <slider
          class='grouped'
          id='luggageSlider'
          onSelectionChanged={({value}) => luggageWeight.text = `${value} Kg`}/>
      <textView class='grouped' id='luggageWeight' text='0 Kg'/>
    </composite>
    <checkBox class='col2 stacked' id='veggie' text='Vegetarian'/>
    <composite class='group'>
      <textView class='col1 grouped' text='Redeem miles:'/>
      <switch class='col2 grouped' id='miles'/>
    </composite>
    <button
        class='colspan'
        id='confirm'
        text='Place Reservation'
        background='#8b0000'
        textColor='white'
        onSelect={updateMessage}/>
    <textView class='colspan' id='message'/>
  </scrollView>
);

let
  scrollView = ui.find(ScrollView).first('#scrollView'),
  confirmButton = ui.find(Button).first('#confirm'),
  luggageSlider = ui.find(Slider).first('#luggageSlider'),
  luggageWeight = ui.find(TextView).first('#luggageWeight'),
  veggie = ui.find(CheckBox).first('#veggie'),
  miles = ui.find(Switch).first('#miles'),
  message = ui.find(TextView).first('#message'),
  nameInput = ui.find(TextInput).first('#name'),
  countryPicker = ui.find(Picker).first('#country'),
  classPicker = ui.find(Picker).first('#class');

scrollView.apply({
  '.stretch': {left: 0, right: 0, top: 0, bottom: 0},
  '.col1': {left: 10, width: 120},
  '.col2': {left: 140, right: 10},
  '.label': {top: 'prev() 18'},
  '.labeled': {baseline: 'prev()'},
  '.stacked': {top: 'prev() 10'},
  '.grouped': {centerY: 0},
  '.group': {left: 0, top: 'prev() 10', right: 0},
  '.colspan': {left: 10, right: 10, top: 'prev() 18'},
  '#luggageSlider': {left: 140, right: 70},
  '#luggageWeight': {right: 10, width: 50}
});

function updateMessage() {
  message.text = [
    'Flight booked for: ' + nameInput.text,
    'Destination: ' + COUNTRIES[countryPicker.selectionIndex],
    'Seating: ' + createSeating(),
    'Luggage: ' + luggageSlider.selection + ' Kg',
    'Meal: ' + veggie.checked ? 'Vegetarian' : 'Standard',
    'Redeem miles: ' + (miles.checked ? 'Yes' : 'No')
  ].join('\n') + '\n';
}

function createSeating() {
  let seating = 'Anywhere';
  scrollView.find('RadioButton').forEach((button: tabris.RadioButton) => {
    if (button.checked) {
      seating = button.text;
    }
  });
  seating += ', ' + CLASSES[classPicker.selectionIndex];
  return seating;
}

import {Widget, Button, Slider, TextView, Picker, CheckBox, Switch, TextInput, ui} from 'tabris';

const COUNTRIES = ['Germany', 'Canada', 'USA', 'Bulgaria'];
const CLASSES = ['Business', 'Economy', 'Economy Plus'];

let scrollView: tabris.ScrollView = (
  <scrollView class='stretch' direction='vertical'>
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
      <slider class='grouped' id='luggageSlider'/>
      <textView class='grouped' id='luggageWeight' text='0 Kg'/>
    </composite>
    <checkBox class='col2 stacked' id='veggie' text='Vegetarian'/>
    <composite class='group'>
      <textView class='col1 grouped' text='Redeem miles:'/>
      <switch class='col2 grouped' id='miles'/>
    </composite>
    <button class='colspan' id='confirm' text='Place Reservation' background='#8b0000' textColor='white'/>
    <textView class='colspan' id='message'/>
  </scrollView>
).apply({
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
}).appendTo(ui.contentView);

$(Button, 'confirm').on('select', () => updateMessage());
$(Slider, 'luggageSlider').on({
  selectionChanged: ({value}) => $(TextView, 'luggageWeight').text = `${value} Kg`
});

function updateMessage() {
  $(TextView, 'message').text = [
    'Flight booked for: ' + $(TextInput, 'name').text,
    'Destination: ' + COUNTRIES[$(Picker, 'country').selectionIndex],
    'Seating: ' + createSeating(),
    'Luggage: ' + ($(Slider, 'luggageSlider').selection + ' Kg'),
    'Meal: ' + ($(CheckBox, 'veggie').checked ? 'Vegetarian' : 'Standard'),
    'Redeem miles: ' + ($(Switch, 'miles').checked ? 'Yes' : 'No')
  ].join('\n') + '\n';
}

function createSeating() {
  let seating = 'Anywhere';
  scrollView.find('RadioButton').forEach((button: tabris.RadioButton) => {
    if (button.checked) {
      seating = button.text;
    }
  });
  seating += ', ' + CLASSES[$(Picker, 'class').selectionIndex];
  return seating;
}

function $<T extends Widget>(type: {new (): T}, id: string): T {
  let result = scrollView.find('#' + id).first() as T;
  if (result == null) {
    throw new Error(`${id} does not exit`);
  }
  if (!(result instanceof type)) {
    throw new Error(`type mismatch: ${id} is not a ${type.name}`);
  }
  return result as T;
}

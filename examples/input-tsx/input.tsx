import {Widget, ScrollView, Slider, TextView, Picker, CheckBox, Switch, TextInput, ui, ScrollViewProperties, EventObject, RadioButton} from 'tabris';

const COUNTRIES = ['Germany', 'Canada', 'USA', 'Bulgaria'];
const CLASSES = ['Business', 'Economy', 'Economy Plus'];
const STYLE = {
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
};

class FlightReservationView extends ScrollView {

  private jsxProperties: JSX.ScrollViewProperties & {
    onConfirm?: (ev: EventObject<FlightReservationView>) => void
  };

  constructor(properties?: ScrollViewProperties) {
    super(properties);
    this.append(
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
        <radioButton class='col2 stacked' text='Anywhere' checked={true} />
        <composite class='group'>
          <textView class='col1 grouped' text='Luggage:'/>
          <slider
              class='grouped'
              id='luggageSlider'
              onSelectionChanged={ev => this.luggageWeightText = `${ev.value} Kg`}/>
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
            onSelect={() => this.trigger('confirm', new EventObject<this>()) }/>
        <textView class='colspan' id='message'/>
      </scrollView>
    ).apply(STYLE);
  }

  public get name() {
    return this.find(TextInput).first('#name').text;
  }

  public get luggageWeight() {
    return this.find(Slider).first('#luggageSlider').selection;
  }

  public get veggie() {
    return this.find(CheckBox).first('#veggie').checked;
  }

  public get miles() {
    return this.find(Switch).first('#miles').checked;
  }

  public get country() {
    return COUNTRIES[this.find(Picker).first('#country').selectionIndex];
  }

  public get serviceClass() {
    return CLASSES[this.find(Picker).first('#class').selectionIndex];
  }

  public get seat() {
    return this.find(RadioButton).filter((button: RadioButton) => button.checked).first().text;
  }

  public set message(text: string) {
    this.find(TextView).first('#message').text = text;
  }

  private set luggageWeightText(text: string) {
    this.find(TextView).first('#luggageWeight').text = text;
  }

}

ui.contentView.append(
  <FlightReservationView left={0} top={0} right={0} bottom={0} onConfirm={updateMessage} />
);

function updateMessage({target}: EventObject<FlightReservationView>) {
  target.message = [
    'Flight booked for: ' + target.name,
    'Destination: ' + target.country,
    'Seating: ' + target.seat + ', ' + target.serviceClass,
    'Luggage: ' + target.luggageWeight + ' Kg',
    'Meal: ' + target.veggie ? 'Vegetarian' : 'Standard',
    'Redeem miles: ' + (target.miles ? 'Yes' : 'No')
  ].join('\n') + '\n';
}

import {
  Slider, TextView, Picker, CheckBox, Switch, TextInput, contentView, ScrollView, Button,
  EventObject, RadioButton, Properties, Composite, WidgetCollection, JSXProperties, Listeners
} from 'tabris';

const STYLE = {
  '.stretch': {left: 0, right: 0, top: 0, bottom: 0},
  '.top': {left: 0, right: 0, top: 0},
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

class ReservationForm extends Composite {

  public readonly jsxProperties: Composite['jsxProperties']
    & JSXProperties<this, 'classes' | 'countries' | 'message' | 'onConfirm'>;
  public readonly classes: string[];
  public readonly countries: string[];
  public readonly onConfirm: Listeners = new Listeners(this, 'confirm');

  constructor({classes, countries, message, ...properties}: Properties<ReservationForm>) {
    super(properties);
    this.classes = classes;
    this.countries = countries;
    this.append(
      <ScrollView class='stretch' direction='vertical'>
        <Composite id='interactive' class='top'>
          <TextView class='col1 label' alignment='left'>Name:</TextView>
          <TextInput class='col2 labeled' id='name' message='Full Name'/>
          <TextView class='col1 label'>Flyer Number</TextView>
          <TextInput class='col2 labeled' keyboard='number' message='Flyer Number'/>
          <TextView class='col1 label'>Passphrase:</TextView>
          <TextInput class='col2 labeled' type='password' message='Passphrase'/>
          <TextView class='col1 label'>Country:</TextView>
          <Picker
              id='country'
              class='col2 labeled'
              itemCount={this.countries.length}
              itemText={index => this.countries[index]}/>
          <TextView class='col1 label'>Class:</TextView>
          <Picker
              id='class'
              class='col2 labeled'
              itemCount={this.classes.length}
              itemText={index => this.classes[index]}/>
          <TextView class='col1 label'>Seat:</TextView>
          <RadioButton class='col2 labeled'>Window</RadioButton>
          <RadioButton class='col2 stacked'>Aisle</RadioButton>
          <RadioButton class='col2 stacked' checked={true}>Anywhere</RadioButton>
          <Composite class='group'>
            <TextView class='col1 grouped'>Luggage:</TextView>
            <Slider
                class='grouped'
                id='luggageSlider'
                onSelectionChanged={ev => this.luggageWeightText = `${ev.value} Kg`}/>
            <TextView class='grouped' id='luggageWeight'>0 Kg</TextView>
          </Composite>
          <CheckBox class='col2 stacked' id='veggie'>Vegetarian</CheckBox>
          <Composite class='group'>
            <TextView class='col1 grouped'>Vegetarian</TextView>
            <Switch class='col2 grouped' id='miles'/>
          </Composite>
          <Button
              class='colspan'
              id='confirm'
              text='Place Reservation'
              background='#8b0000'
              textColor='white'
              onSelect={() => this.trigger('confirm', new EventObject<this>()) }/>
        </Composite>
        <TextView class='colspan' id='message'/>
      </ScrollView>
    )._apply(STYLE);
    this.message = message;
  }

  public children() {
    // prevent outside access to my children:
    return new WidgetCollection();
  }

  public get name() {
    return this._find(TextInput).first('#name').text;
  }

  public get luggageWeight() {
    return this._find(Slider).first('#luggageSlider').selection;
  }

  public get veggie() {
    return this._find(CheckBox).first('#veggie').checked;
  }

  public get miles() {
    return this._find(Switch).first('#miles').checked;
  }

  public get country() {
    let picker = this._find(Picker).first('#country');
    return picker.itemText(picker.selectionIndex);  }

  public get serviceClass() {
    let picker = this._find(Picker).first('#class');
    return picker.itemText(picker.selectionIndex);
  }

  public get seat() {
    return this._find(RadioButton).filter((button: RadioButton) => button.checked).first().text;
  }

  public set message(text: string) {
    this._find(TextView).first('#message').text = text;
  }

  public set enabled(enabled: boolean) {
    this._find('#interactive').set({enabled});
  }

  public get enabled() {
    return this._find('#interactive').first().enabled;
  }

  private set luggageWeightText(text: string) {
    this._find(TextView).first('#luggageWeight').text = text;
  }

}

contentView.append(
  <ReservationForm
      left={0} top={0} right={0} bottom={0}
      classes={['Business', 'Economy', 'Economy Plus']}
      countries={['Germany', 'Canada', 'USA', 'Bulgaria']}
      message='No flight reserved yet'
      onConfirm={updateMessage} />
);

function updateMessage({target}: EventObject<ReservationForm>) {
  target.set({
    enabled: false,
    message: [
    'Flight booked for: ' + target.name,
    'Destination: ' + target.country,
    'Seating: ' + target.seat + ', ' + target.serviceClass,
    'Luggage: ' + target.luggageWeight + ' Kg',
    'Meal: ' + (target.veggie ? 'Vegetarian' : 'Standard'),
    'Redeem miles: ' + (target.miles ? 'Yes' : 'No')
  ].join('\n') + '\n'});
}

class CustomComponent extends Composite {

  public set foo(value: number) { /* ... */ }
  public get foo() { /* ... */ }
  public readonly onMyEvent: Listeners = new Listeners(this, 'myEvent');
  protected readonly jsxProperties: Composite['jsxProperties'] & {
    // Properties and events introduced in CustomComponent:
    foo?: number;
    onMyEvent?: Listeners;
  };

  constructor(properties: Partial<CustomComponent>) {
    super(properties);
    // ...
  }

  // methods...

}

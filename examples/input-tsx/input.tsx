import {Widget, ScrollView, Slider, TextView, Picker, CheckBox, Switch, TextInput, ui, ScrollViewProperties, EventObject, RadioButton, Properties, Partial, CompositeProperties, Composite} from 'tabris';

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

type ReservationFormCreateArgs = Properties<ReservationForm> & {
  classes: string[]; countries: string[];
};

class ReservationForm extends Composite {

  public readonly tsProperties: CompositeProperties & Partial<this, 'message'>;

  public readonly jsxProperties: ReservationFormCreateArgs & JSX.CompositeEvents & {
    onConfirm?: (ev: EventObject<ReservationForm>) => void
  };

  constructor(args?: ReservationFormCreateArgs) {
    super();
    let {classes, countries, ...properties} = args;
    this.append(
      <scrollView class='stretch' direction='vertical'>
        <composite id='interactive' class='top'>
          <textView class='col1 label' alignment='left'>Name:</textView>
          <textInput class='col2 labeled' id='name' message='Full Name'/>
          <textView class='col1 label'>Flyer Number</textView>
          <textInput class='col2 labeled' keyboard='number' message='Flyer Number'/>
          <textView class='col1 label'>Passphrase:</textView>
          <textInput class='col2 labeled' type='password' message='Passphrase'/>
          <textView class='col1 label'>Country:</textView>
          <picker
              id='country'
              class='col2 labeled'
              itemCount={countries.length}
              itemText={index => countries[index]}/>
          <textView class='col1 label'>Class:</textView>
          <picker
              id='class'
              class='col2 labeled'
              itemCount={classes.length}
              itemText={index => classes[index]}/>
          <textView class='col1 label'>Seat:</textView>
          <radioButton class='col2 labeled'>Window</radioButton>
          <radioButton class='col2 stacked'>Aisle</radioButton>
          <radioButton class='col2 stacked' checked={true}>Anywhere</radioButton>
          <composite class='group'>
            <textView class='col1 grouped'>Luggage:</textView>
            <slider
                class='grouped'
                id='luggageSlider'
                onSelectionChanged={ev => this.luggageWeightText = `${ev.value} Kg`}/>
            <textView class='grouped' id='luggageWeight'>0 Kg</textView>
          </composite>
          <checkBox class='col2 stacked' id='veggie'>Vegetarian</checkBox>
          <composite class='group'>
            <textView class='col1 grouped'>Vegetarian</textView>
            <switch class='col2 grouped' id='miles'/>
          </composite>
          <button
              class='colspan'
              id='confirm'
              text='Place Reservation'
              background='#8b0000'
              textColor='white'
              onSelect={() => this.trigger('confirm', new EventObject<this>()) }/>
        </composite>
        <textView class='colspan' id='message'/>
      </scrollView>
    ).apply(STYLE).set(properties);
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
    let picker = this.find(Picker).first('#country');
    return picker.itemText(picker.selectionIndex);  }

  public get serviceClass() {
    let picker = this.find(Picker).first('#class');
    return picker.itemText(picker.selectionIndex);
  }

  public get seat() {
    return this.find(RadioButton).filter((button: RadioButton) => button.checked).first().text;
  }

  public set message(text: string) {
    this.find(TextView).first('#message').text = text;
  }

  public set enabled(enabled: boolean) {
    this.find('#interactive').set({enabled});
  }

  public get enabled() {
    return this.find('#interactive').first().enabled;
  }

  private set luggageWeightText(text: string) {
    this.find(TextView).first('#luggageWeight').text = text;
  }

}

ui.contentView.append(
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

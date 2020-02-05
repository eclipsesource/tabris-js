import {
  AlertDialog,
  Button,
  CheckBox,
  Composite,
  contentView,
  Picker,
  RadioButton,
  ScrollView,
  Slider,
  StackLayout,
  Switch,
  TextInput,
  TextView
} from 'tabris';

const CLASS = ['Business', 'Economy', 'First class'];

contentView.append(
  <ScrollView stretch layout={new StackLayout({spacing: 16, alignment: 'stretchX'})} padding={16}>
    <TextView text='Personal details' font='medium 16px'/>
    <TextInput id='name' message='Full name'/>
    <TextInput id='flyerNumber' message='Flyer number' keyboard='number'/>
    <TextInput id='password' message='Password' type='password'/>
    <Picker id='class' itemCount={CLASS.length} itemText={(index) => CLASS[index]} message='Class'/>
    <TextView text='Seat' font='medium 16px'/>
    <RadioButton id='seatWindow' text='Window' checked/>
    <RadioButton id='seatAisle' text='Aisle'/>
    <TextView text='Luggage weight' font='medium 16px'/>
    <Composite height={48}>
      <Slider id='luggage' left right='56' centerY maximum={20} selection={15}
          onSelectionChanged={e => { e.target.siblings(TextView).only().text = `${e.value} kg`; }}/>
      <TextView right={16} centerY text='15 kg'/>
    </Composite>
    <CheckBox id='vegetarian' text='Vegetarian' checked/>
    <Composite height={48}>
      <TextView left right='next() 16' centerY text='Redeem miles'/>
      <Switch id='miles' right centerY checked/>
    </Composite>
    <Button text='Book flight' onTap={placeReservation}/>
  </ScrollView>
);

function placeReservation() {
  const message =
    `Name: ${$(TextInput).only('#name').text}\n` +
    `Flyer number: ${$(TextInput).only('#flyerNumber').text}\n` +
    `Password: ${$(TextInput).only('#password').text}\n` +
    `Class: ${CLASS[$(Picker).only('#class').selectionIndex]}\n` +
    `Seat: ${$(RadioButton).filter((button) => button.checked).first().text}\n` +
    `Luggage: ${$(Slider).only('#luggage').selection} kg\n` +
    `Vegetarian: ${$(CheckBox).only('#vegetarian').checked ? 'yes' : 'no'}\n` +
    `Redeem miles: ${$(Switch).only('#miles').checked ? 'yes' : 'no'} `;
  AlertDialog.open(
    <AlertDialog title='Book flight?' message={message} buttons={{ok: 'Book', cancel: 'Cancel'}}/>
  );
}

import {RadioButton, Stack, contentView} from 'tabris';

contentView.set({padding: 12}).append(
  <Stack>
    <RadioButton text='One' onCheckedChanged={handleChecked}/>
    <RadioButton text='Two' onCheckedChanged={handleChecked}/>
    <RadioButton text='Three' onCheckedChanged={handleChecked}/>
  </Stack>
);

/** @param {tabris.PropertyChangedEvent<RadioButton, boolean>} ev */
function handleChecked(ev) {
  if (ev.value) {
    console.log(ev.target.text + ' checked');
  }
}

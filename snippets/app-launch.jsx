import {TextInput, TextView, Button, app, contentView, Stack} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <TextInput text='http://tabris.com'/>
    <Button onSelect={launch}>Launch</Button>
    <TextView/>
  </Stack>
);

const textView = $(TextView).only();
const textInput = $(TextInput).only();

async function launch() {
  try {
    await app.launch(textInput.text);
    textView.text = 'Url has been launched';
  } catch (ex) {
    textView.text = ex.message;
  }
}

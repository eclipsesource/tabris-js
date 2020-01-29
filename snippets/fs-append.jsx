import {fs, contentView, TextView, Stack, Button, TextInput, AlertDialog} from 'tabris';

const DIR = fs.cacheDir + '/logs';
const FILE = DIR + '/fs.log';

contentView.append(
  <Stack>
    <TextInput>Hello World</TextInput>
    <Button onSelect={append}>Append text to file</Button>
    <Button onSelect={view}>View file</Button>
    <Button onSelect={clean}>Clean</Button>
    <TextView/>
  </Stack>
);

const message = $(TextView).only();

async function append() {
  const data = new Date().toLocaleTimeString() + ' - ' + $(TextInput).only().text + '\n';
  if (await fs.appendToFile(FILE, data, 'utf-8')) {
    message.text = `Created ${FILE}`;
  } else {
    message.text = `Appended to ${FILE}`;
  }
}

async function view() {
  AlertDialog.open(await fs.readFile(FILE, 'utf-8'));
}

async function clean() {
  if (fs.isDir(DIR)) {
    await fs.removeDir(DIR);
    message.text = `Deleted ${DIR}`;
  } else {
    message.text = `Directory ${DIR} did not exist.`;
  }
}

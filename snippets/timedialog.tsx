import { TimeDialog, Button, Stack, TextView, contentView } from 'tabris';

contentView.append(
  <Stack stretch padding={8} spacing={16} alignment='stretchX'>
    <Button onSelect={showSimpleDialog}>Simple time dialog</Button>
    <Button onSelect={showSpecificTime}>Dialog with pre-set time</Button>
    <TextView/>
  </Stack>
);

const textView =  $(TextView).only();

async function showSimpleDialog() {
  const {date} = await TimeDialog.open().onClose.promise();
  textView.text = date ? `Picked ${date.toTimeString()}` : 'Canceled';
}

async function showSpecificTime() {
  const {date} = await TimeDialog.open(new Date(1, 1, 1, 20, 15)).onClose.promise();
  textView.text = date ? `Picked ${date.toTimeString()}` : 'Canceled';
}

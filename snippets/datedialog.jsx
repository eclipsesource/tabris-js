import {DateDialog, Button, Stack, TextView, contentView} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <Button onSelect={showSimpleDialog}>Simple date dialog</Button>
    <Button onSelect={showSpecificDate}>Dialog with pre-set date</Button>
    <Button onSelect={showMinMaxDate}>Dialog with min/max date</Button>
    <TextView/>
  </Stack>
);

const FIVE_DAYS = 432000000;
const textView =  $(TextView).only();

async function showSimpleDialog() {
  const {date} = await DateDialog.open().onClose.promise();
  textView.text = date ? `Picked ${date.toDateString()}` : 'Canceled';
}

async function showSpecificDate() {
  const {date} = await DateDialog.open(new Date(2012, 12, 12)).onClose.promise();
  textView.text = date ? `Picked ${date.toDateString()}` : 'Canceled';
}

async function showMinMaxDate() {
  const now = new Date().getTime();
  DateDialog.open(
    <DateDialog
        minDate={new Date(now - FIVE_DAYS)}
        maxDate={new Date(now + FIVE_DAYS)}
        onClose={({date}) => textView.text = date ? `Picked ${date.toDateString()}` : 'Canceled'}/>
  );
}

import {Button, TextView, contentView, Stack} from 'tabris';

contentView.append(
  <Stack stretchX alignment='stretchX' spacing={16} padding={16}>
    <Button onSelect={loadData}>Show my location</Button>
    <TextView/>
  </Stack>
);

async function loadData() {
  const response = await fetch('http://ip-api.com/json');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  const data = await response.json();
  $(TextView).only().text = `You appear to be in ${data.city ? data.city : data.country}`;
}

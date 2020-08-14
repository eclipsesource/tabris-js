import {authentication, Button, contentView, Stack, TextView} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <Button onSelect={authenticate} text='Authenticate'/>
    <TextView alignment='centerX'/>
  </Stack>
);

async function authenticate() {
  try {
    const result = await authentication.authenticate();
    $(TextView).only().text = `RESULT: ${result.status}${result.message ? ' - ' + result.message : ''}`;
  } catch (error) {
    $(TextView).only().text = `ERROR: ${error.message}`;
  }
}

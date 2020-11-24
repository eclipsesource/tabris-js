import {Button, TextView, contentView, Stack} from 'tabris';

contentView.append(
  <Stack stretchX alignment='stretchX' spacing={16} padding={16}>
    <Button onSelect={send}>Request echo from postman</Button>
    <TextView/>
  </Stack>
);

async function send() {
  const formData = new FormData();
  formData.set('Hello', 'World');
  const response = await fetch('https://postman-echo.com/post', {method: 'POST', body: formData});
  const data = await response.json();
  $(TextView).only().text = JSON.stringify(data.form);
}

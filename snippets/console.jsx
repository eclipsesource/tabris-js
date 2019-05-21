import {tabris, Button, TextInput, contentView, TextView, Stack} from 'tabris';

contentView.append(
  <Stack stretch padding={16} alignment='stretchX' spacing={8}>
    <TextInput bottom={16} text='Message' message='Log message'/>
    <Button text='debug' onSelect={() => console.debug(input.text)}/>
    <Button text='log' onSelect={() => console.log(input.text)}/>
    <Button text='info' onSelect={() => console.info(input.text)}/>
    <Button text='warn' onSelect={() => console.warn(input.text)}/>
    <Button text='error' onSelect={() => console.error(input.text)}/>
    <Button text='trace' onSelect={printTrace}/>
    <TextView top={16} font='18px'/>
  </Stack>
);

const input = $(TextInput).only();
const output = $(TextView).only();

tabris.onLog(ev =>
  output.text = ev.level + ': ' + ev.message
);

function printTrace() {
  // This line should appear in the trace:
  console.trace();
}

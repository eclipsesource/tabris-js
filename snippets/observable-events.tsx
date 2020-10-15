import {Slider, Stack, TextView, contentView, Button} from 'tabris';

contentView.append(
  <Stack stretch padding={8} spacing={8} alignment='stretchX'>
    <Slider/>
    <TextView>...</TextView>
    <Button onSelect={() => $(Slider).dispose()}>Dispose Slider</Button>
  </Stack>
);

$(Slider).only().onSelect
  .subscribe(
    selection => $(TextView).only().text = 'selection: ' + selection,
    ex => console.error(ex),
    () => $(TextView).only().text = 'complete'
  );

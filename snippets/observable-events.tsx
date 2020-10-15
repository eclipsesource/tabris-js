import {Slider, Stack, TextView, contentView, Button} from 'tabris';

contentView.append(
  <Stack stretch padding={8} spacing={8} alignment='stretchX'>
    <Slider/>
    <TextView/>
    <Button onSelect={() => $(Slider).dispose()}>Dispose Slider</Button>
  </Stack>
);

$(Slider).only().onSelectionChanged.values
  .subscribe(
    selection => $(TextView).only().text = 'value: ' + selection,
    ex => console.error(ex),
    () => $(TextView).only().text = 'complete'
  );

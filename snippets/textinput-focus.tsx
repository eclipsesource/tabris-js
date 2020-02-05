import {Composite, contentView, PropertyChangedEvent, Stack, Switch, TextInput} from 'tabris';

contentView.append(
  <Stack stretch alignment='stretchX' padding={16} spacing={16}>
    <Composite>
      <TextInput left right='next() 16' message='Regular' onFocusedChanged={toggleSwitch}/>
      <Switch right centerY onCheckedChanged={toggleFocus}/>
    </Composite>
    <Composite>
      <TextInput left right='next() 16' message='Regular' onFocusedChanged={toggleSwitch}/>
      <Switch right centerY onCheckedChanged={toggleFocus}/>
    </Composite>
    <Composite>
      <TextInput left right='next() 16' message='KeepFocus' keepFocus onFocusedChanged={toggleSwitch}/>
      <Switch right centerY onCheckedChanged={toggleFocus}/>
    </Composite>
  </Stack>
);

function toggleSwitch(e: PropertyChangedEvent<TextInput, boolean>) {
  const switchButton = e.target.siblings(Switch).only();
  if (switchButton.checked !== e.value) {
    switchButton.checked = e.value;
  }
}

function toggleFocus(e: PropertyChangedEvent<Switch, boolean>) {
  const textInput = e.target.siblings(TextInput).only();
  if (textInput.focused !== e.value) {
    textInput.focused = e.value;
  }
}

import {CheckBox, contentView, Stack, TextView} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <TextView markupEnabled font='16px'>
      Normal Text <b>bold</b> <i>italic</i><br/>
      <big>big</big><br/>
      <small>small</small><br/>
      <strong>strong</strong><br/>
      <ins>inserted</ins><br/>
      <del>deleted</del>
    </TextView>
    <CheckBox text='Enable markup' checked onSelect={e => $(TextView).only().markupEnabled = e.checked}/>
  </Stack>
);

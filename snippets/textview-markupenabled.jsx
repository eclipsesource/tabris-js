import {CheckBox, contentView, Stack, TextView, Font} from 'tabris';

contentView.append(
  <Stack stretch padding={16} spacing={16} alignment='stretchX'>
    <TextView markupEnabled font='16px'>
      Normal Text <b>bold</b> <i>italic</i><br/>
      <big>big</big><br/>
      <small>small</small><br/>
      <strong>strong</strong><br/>
      <ins>inserted</ins><br/>
      <del>deleted</del><br/>
      <a href='http://example.com'>hyperlink</a><br/>
      <span textColor='red'>colorful</span><br/>
      <span font='bold 16px monospace'>other font</span><br/>
      <del font={{family: [Font.serif], size: 48}} textColor={[100, 200, 50, 150]}>combined</del><br/>
      <a href='http://example.com' textColor='#ff3595' font={{family: [Font.serif], size: 32}}>colorful link</a><br/>
    </TextView>
    <CheckBox text='Enable markup' checked onSelect={e => $(TextView).only().markupEnabled = e.checked}/>
  </Stack>
);

import {TextView, contentView, CheckBox, Stack} from 'tabris';

contentView.append(
  <Stack>
    <TextView markupEnabled font='16px' padding={12}>
      Normal Text<br/>
      <b>bold</b><br/>
      <i>italic</i><br/>
      <big>big</big><br/>
      <small>small</small><br/>
      <strong>strong</strong><br/>
      <ins>inserted</ins><br/>
      <del>deleted</del><br/>
    </TextView>
    <CheckBox checked onSelect={updateMarkupEnabled}>markupEnabled</CheckBox>
  </Stack>
);

function updateMarkupEnabled({checked: markupEnabled}) {
  contentView.find(TextView).set({markupEnabled});
}

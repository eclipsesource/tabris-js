import {TextView, contentView, CheckBox, StackComposite} from 'tabris';

contentView.append(
  <StackComposite>
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
  </StackComposite>
);

function updateMarkupEnabled({checked: markupEnabled}) {
  contentView.find(TextView).set({markupEnabled});
}

import {Button, CheckBox, contentView, Stack} from 'tabris';

contentView.append(
  <Stack spacing={4} padding={16}>
    <Button style='default' text='Default'/>
    <Button style='elevate' text='Elevate'/>
    <Button style='outline' text='Outline'/>
    <Button style='flat' text='Flat'/>
    <Button style='text' text='Text'/>
    <CheckBox top={24} text='Tint background' onSelect={(tintBackground)}/>
    <CheckBox text='Tint textColor' onSelect={tintTextColor}/>
    <CheckBox text='Tint stroke' onSelect={tintStrokeColor}/>
    <CheckBox text='Wider stroke' onSelect={toggleStrokeWidth}/>
    <CheckBox text='Wider corner radius' onSelect={toggleCornerRadius}/>
    <CheckBox text='Buttons enabled' checked onSelect={toggleEnabled}/>
    <CheckBox text='Show icons' onSelect={toggleImage}/>
  </Stack>
);

/** @param {tabris.CheckBoxSelectEvent} ev */
function tintBackground({checked}) {
  $(Button).set({background: checked ? 'red' : 'initial'});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function tintTextColor({checked}) {
  $(Button).set({textColor: checked ? 'blue' : 'initial'});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function tintStrokeColor({checked}) {
  $(Button).filter(hasOutlineStyle).set({strokeColor: checked ? 'green' : 'initial'});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function toggleStrokeWidth({checked}) {
  $(Button).filter(hasOutlineStyle).set({strokeWidth: checked ? 4 : 1});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function toggleEnabled({checked}) {
  $(Button).set({enabled: checked});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function toggleCornerRadius({checked}) {
  $(Button).set({cornerRadius: checked ? 20 : 4});
}

/** @param {tabris.CheckBoxSelectEvent} ev */
function toggleImage({checked}) {
  $(Button).set({image: checked ? 'resources/settings-black-24dp@3x.png' : null});
}

/** @param {Button} button */
function hasOutlineStyle(button) {
  return button.style === 'outline';
}

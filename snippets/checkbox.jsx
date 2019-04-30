import {CheckBox, contentView} from 'tabris';

contentView.append(
  <CheckBox checked padding={16} onSelect={updateText}>unchecked</CheckBox>
);

/** @param {tabris.CheckBoxSelectEvent} ev */
function updateText(ev) {
  ev.target.text = ev.checked ? 'checked' : 'unchecked';
}

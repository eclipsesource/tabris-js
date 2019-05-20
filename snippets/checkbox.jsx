import {CheckBox, contentView} from 'tabris';

contentView.append(
  <CheckBox left={16} top={16} checked onSelect={updateText}>checked</CheckBox>
);

/** @param {tabris.CheckBoxSelectEvent} ev */
function updateText(ev) {
  ev.target.text = ev.checked ? 'checked' : 'unchecked';
}

import {TextInput, TextView, contentView} from 'tabris';

contentView.append(
  <TextInput top={24} left='20%' right='20%'
      message='Type here, then confirm'
      onAccept={handleAccept}/>
);

/** @param {tabris.TextInputAcceptEvent} ev */
function handleAccept(ev) {
  contentView.append(
    <TextView top='prev() 16' left='20%' text={ev.text}/>
  );
}

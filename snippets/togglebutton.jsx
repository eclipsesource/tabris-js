import {ToggleButton, contentView} from 'tabris';

contentView.set({padding: 16}).append(
  <ToggleButton checked text='checked'
     onCheckedChanged={ev => ev.target.text = ev.value ? 'checked' : 'not checked'}/>
);

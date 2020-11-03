import {TextInput, contentView} from 'tabris';

TextInput({
  top: 25, left: '20%', right: '20%',
  message: 'numbers only',
  onBeforeTextChange(ev) {
    if (!/^[0-9]*$/.test(ev.newValue)) {
      ev.preventDefault();
    }
  }
}).appendTo(contentView);

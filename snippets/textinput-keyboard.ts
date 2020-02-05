import {TextInput, contentView} from 'tabris';

new TextInput({
  top: 25, left: '20%', right: '20%',
  message: 'default'
}).appendTo(contentView);

const KEYBOARDS: Array<TextInput['keyboard']>
  = ['ascii', 'decimal', 'number', 'numbersAndPunctuation', 'phone', 'email', 'url'];

KEYBOARDS.forEach((mode) => {
  new TextInput({
    top: 'prev() 10', left: '20%', right: '20%',
    keyboard: mode,
    message: mode
  }).appendTo(contentView);
});

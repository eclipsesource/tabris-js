import {TextInput, TextView, contentView} from 'tabris';

// Create a text input field with input finished listener

new TextInput({
  top: 20, left: '20%', right: '20%',
  message: 'Type here, then confirm'
}).on('accept', ({text}) => {
  new TextView({
    top: 'prev() 20', left: '20%',
    text
  }).appendTo(contentView);
}).appendTo(contentView);

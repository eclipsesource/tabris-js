import {TextInput, contentView} from 'tabris';

new TextInput({
  top: 20, left: '20%', right: '20%',
  message: 'Colorful typing...',
  font: '22px sans-serif'
}).onFocus(({target}) => {
    target.fillColor = 'yellow';
    target.borderColor = 'yellow';
  })
  .onBlur(({target}) => target.borderColor = 'red')
  .appendTo(contentView);

new TextInput({
  top: 'prev() 20', left: '20%', right: '20%',
  message: 'This text field keeps its focus forever',
  keepFocus: true
}).appendTo(contentView);

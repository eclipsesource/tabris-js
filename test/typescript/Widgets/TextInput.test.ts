import {Color, TextInput} from 'tabris';

let widget: TextInput = new TextInput();

// Properties
let alignment: 'center' | 'left' | 'right';
let autoCapitalize: boolean;
let autoCorrect: boolean;
let borderColor: Color;
let editable: boolean;
let fillColor: Color;
let focused: boolean;
let keepFocus: boolean;
let keyboard: 'ascii' | 'decimal' | 'default' | 'email' | 'number' | 'numbersAndPunctuation' | 'phone' | 'url';
let enterKeyType: 'default' | 'done' | 'next' | 'send' | 'search' | 'go';
let message: string;
let text: string;
let textColor: Color;
let type: 'default' | 'multiline' | 'password' | 'search';

alignment = widget.alignment;
autoCapitalize = widget.autoCapitalize;
autoCorrect = widget.autoCorrect;
borderColor = widget.borderColor;
editable = widget.editable;
fillColor = widget.fillColor;
focused = widget.focused;
keepFocus = widget.keepFocus;
keyboard = widget.keyboard;
enterKeyType = widget.enterKeyType;
message = widget.message;
text = widget.text;
textColor = widget.textColor;
type = widget.type;

widget.alignment = alignment;
widget.autoCapitalize = autoCapitalize;
widget.autoCorrect = autoCorrect;
widget.borderColor = borderColor;
widget.editable = editable;
widget.fillColor = fillColor;
widget.focused = focused;
widget.keepFocus = keepFocus;
widget.keyboard = keyboard;
widget.enterKeyType = enterKeyType;
widget.message = message;
widget.text = text;
widget.textColor = textColor;
widget.type = type;

// Events

widget.on({
  accept: event => text = event.text,
  blur: event => {},
  focus: event => {},
  textChanged: event => text = event.value,
  input: event => text = event.text
});

import {TextInput, Color} from 'tabris';

let widget: TextInput;

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
let message: string;
let text: string;
let type: 'default' | 'multiline' | 'password' | 'search';

widget.alignment = alignment;
widget.autoCapitalize = autoCapitalize;
widget.autoCorrect = autoCorrect;
widget.borderColor = borderColor;
widget.editable = editable;
widget.fillColor = fillColor;
widget.focused = focused;
widget.keepFocus = keepFocus;
widget.keyboard = keyboard;
widget.message = message;
widget.text = text;
widget.type = type;

alignment = widget.alignment;
autoCapitalize = widget.autoCapitalize;
autoCorrect = widget.autoCorrect;
borderColor = widget.borderColor;
editable = widget.editable;
fillColor = widget.fillColor;
focused = widget.focused;
keepFocus = widget.keepFocus;
keyboard = widget.keyboard;
message = widget.message;
text = widget.text;
type = widget.type;

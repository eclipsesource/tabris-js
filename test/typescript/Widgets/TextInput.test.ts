import {
  Color,
  EventObject,
  PropertyChangedEvent,
  TextInput,
  TextInputAcceptEvent,
  TextInputInputEvent,
  TextInputProperties,
  TextInputSelectEvent,
  TextInputBeforeTextChangeEvent
} from 'tabris';

let widget: TextInput = new TextInput();

// Properties
let alignment: 'center' | 'left' | 'right';
let autoCapitalize: true | false | 'none' | 'sentence' | 'word' | 'all';
let autoCorrect: boolean;
let borderColor: Color;
let editable: boolean;
let fillColor: Color;
let cursorColor: Color;
let focused: boolean;
let keepFocus: boolean;
let keyboard: 'ascii' | 'decimal' | 'default' | 'email' | 'number' | 'numbersAndPunctuation' | 'phone' | 'url';
let enterKeyType: 'default' | 'done' | 'next' | 'send' | 'search' | 'go';
let message: string;
let text: string;
let textColor: Color;
let textInputType: 'default' | 'multiline' | 'password' | 'search';
let selection: number[];
let keyboardAppearanceMode: 'never' | 'ontouch' | 'onfocus';

alignment = widget.alignment;
autoCapitalize = widget.autoCapitalize;
autoCorrect = widget.autoCorrect;
borderColor = widget.borderColor;
editable = widget.editable;
fillColor = widget.fillColor;
cursorColor = widget.cursorColor;
focused = widget.focused;
keepFocus = widget.keepFocus;
keyboard = widget.keyboard;
enterKeyType = widget.enterKeyType;
message = widget.message;
text = widget.text;
textColor = widget.textColor;
textInputType = widget.type;
selection = widget.selection;
keyboardAppearanceMode = widget.keyboardAppearanceMode;

widget.alignment = alignment;
widget.autoCapitalize = autoCapitalize;
widget.autoCorrect = autoCorrect;
widget.borderColor = borderColor;
widget.editable = editable;
widget.fillColor = fillColor;
widget.cursorColor = cursorColor;
widget.focused = focused;
widget.keepFocus = keepFocus;
widget.keyboard = keyboard;
widget.enterKeyType = enterKeyType;
widget.message = message;
widget.text = text;
widget.textColor = textColor;
widget.type = textInputType;
widget.selection = selection;
widget.keyboardAppearanceMode = keyboardAppearanceMode;

let properties: TextInputProperties = {
  alignment,
  autoCapitalize,
  autoCorrect,
  borderColor,
  editable,
  fillColor,
  cursorColor,
  focused,
  keepFocus,
  keyboard,
  enterKeyType,
  message,
  text,
  textColor,
  selection,
  keyboardAppearanceMode,
  type: textInputType
};
widget = new TextInput(properties);
widget.set(properties);

// Events
let target: TextInput = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let textValue: string = 'bar';
let selectionValue: number[] = [1, 2];
let newValue: string = 'foo';
let oldValue: string = 'foo';

let acceptEvent: TextInputAcceptEvent = {target, timeStamp, type, text};
let blurEvent: EventObject<TextInput> = {target, timeStamp, type};
let focusEvent: EventObject<TextInput> = {target, timeStamp, type};
let inputEvent: TextInputInputEvent = {target, timeStamp, type, text};
let textChangedEvent: PropertyChangedEvent<TextInput, string> = {target, timeStamp, type, value: textValue};
let selectEvent: TextInputSelectEvent = {target, timeStamp, type, selection};
let selectionChangedEvent: PropertyChangedEvent<TextInput, number[]> = {target, timeStamp, type, value: selectionValue};
let beforeTextChangeEvent: TextInputBeforeTextChangeEvent = {target, timeStamp, type, newValue, oldValue, preventDefault() {}};

widget.on({
  accept: (event: TextInputAcceptEvent) => {},
  blur: (event: EventObject<TextInput>) => {},
  focus: (event: EventObject<TextInput>) => {},
  input: (event: TextInputInputEvent) => {},
  select: (event: TextInputSelectEvent) => {},
  textChanged: (event: PropertyChangedEvent<TextInput, string>) => {},
  selectionChanged: (event: PropertyChangedEvent<TextInput, number[]>) => {},
  beforeTextChange: (event: TextInputBeforeTextChangeEvent) => {}
});

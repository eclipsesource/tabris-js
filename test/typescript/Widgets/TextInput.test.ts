import {
  ColorValue, EventObject, PropertyChangedEvent, TextInput, TextInputAcceptEvent, TextInputInputEvent,
  TextInputSelectEvent, Properties, FontValue
} from 'tabris';

let widget: TextInput = new TextInput({type: 'password'});

// Properties
let alignment: 'center' | 'left' | 'right';
let autoCapitalize: true | false | 'none' | 'sentence' | 'word' | 'all';
let autoCorrect: boolean;
let borderColor: ColorValue;
let editable: boolean;
let fillColor: ColorValue;
let cursorColor: ColorValue;
let focused: boolean;
let keepFocus: boolean;
let keyboard: 'ascii' | 'decimal' | 'default' | 'email' | 'number' | 'numbersAndPunctuation' | 'phone' | 'url';
let enterKeyType: 'default' | 'done' | 'next' | 'send' | 'search' | 'go';
let message: string;
let text: string;
let textColor: ColorValue;
let textInputType: 'default' | 'multiline' | 'password' | 'search';
let selection: number[];
let font: FontValue;

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
font = widget.font;

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
widget.selection = selection;
widget.font = font;

let properties: Properties<TextInput> = {
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

let acceptEvent: TextInputAcceptEvent = {target, timeStamp, type, text};
let blurEvent: EventObject<TextInput> = {target, timeStamp, type};
let focusEvent: EventObject<TextInput> = {target, timeStamp, type};
let inputEvent: TextInputInputEvent = {target, timeStamp, type, text};
let textChangedEvent: PropertyChangedEvent<TextInput, string> = {target, timeStamp, type, value: textValue};
let selectEvent: TextInputSelectEvent = {target, timeStamp, type, selection};
let selectionChangedEvent: PropertyChangedEvent<TextInput, number[]> = {target, timeStamp, type, value: selectionValue};

widget
  .onAccept((event: TextInputAcceptEvent) => {})
  .onBlur((event: EventObject<TextInput>) => {})
  .onFocus((event: EventObject<TextInput>) => {})
  .onInput((event: TextInputInputEvent) => {})
  .onSelect((event: TextInputSelectEvent) => {})
  .onTextChanged((event: PropertyChangedEvent<TextInput, string>) => {})
  .onSelectionChanged((event: PropertyChangedEvent<TextInput, number[]>) => {});

class CustomComponent extends TextInput {
  public foo: string;
  constructor(props: Properties<TextInput> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

import { ColorValue, Picker, PickerSelectEvent, Properties, PropertyChangedEvent, FontValue } from 'tabris';

let widget: Picker = new Picker();

// Properties
let borderColor: ColorValue;
let itemCount: number;
let itemText: (index: number) => string;
let selectionIndex: number;
let textColor: ColorValue;
let font: FontValue;
let message: string;
let floatMessage: boolean;
let style: 'default' | 'outline' | 'fill' | 'underline' | 'none';

borderColor = widget.borderColor;
itemCount = widget.itemCount;
itemText = widget.itemText;
selectionIndex = widget.selectionIndex;
textColor = widget.textColor;
font = widget.font;
message = widget.message;
floatMessage = widget.floatMessage;
style = widget.style;

widget.borderColor = borderColor;
widget.itemCount = itemCount;
widget.itemText = itemText;
widget.selectionIndex = selectionIndex;
widget.textColor = textColor;
widget.font = font;
widget.message = message;
widget.floatMessage = floatMessage;
widget.style = style;

let properties = {borderColor, itemCount, itemText, selectionIndex, textColor, font, style, message, floatMessage};
widget = new Picker(properties);
widget.set(properties);

// Events
let target: Picker = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let index: number = 0;
let value: number = 0;

let selectionIndexChangedEvent: PropertyChangedEvent<Picker, number> = {target, timeStamp, type, value};
let pickerSelectEvent: PickerSelectEvent = {target, timeStamp, type, index};

widget
  .onSelectionIndexChanged((event: PropertyChangedEvent<Picker, number>) => {})
  .onSelect((event: PickerSelectEvent) => {});

class CustomComponent extends Picker {
  public foo: string;
  constructor(props: Properties<Picker> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

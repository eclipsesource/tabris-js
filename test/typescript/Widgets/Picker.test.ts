import {ColorValue, Picker, PickerSelectEvent, PropertyChangedEvent, Properties} from 'tabris';

let widget: Picker = new Picker();

// Properties
let borderColor: ColorValue;
let fillColor: ColorValue;
let itemCount: number;
let itemText: (index: number) => string;
let selectionIndex: number;
let textColor: ColorValue;

borderColor = widget.borderColor;
fillColor = widget.fillColor;
itemCount = widget.itemCount;
itemText = widget.itemText;
selectionIndex = widget.selectionIndex;
textColor = widget.textColor;

widget.borderColor = borderColor;
widget.fillColor = fillColor;
widget.itemCount = itemCount;
widget.itemText = itemText;
widget.selectionIndex = selectionIndex;
widget.textColor = textColor;

let properties = {borderColor, fillColor, itemCount, itemText, selectionIndex, textColor};
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

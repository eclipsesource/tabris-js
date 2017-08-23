import {Color, Picker, PickerSelectEvent} from 'tabris';

let widget: Picker = new Picker();

// Properties
let borderColor: Color;
let fillColor: Color;
let itemCount: number;
let itemText: (index: number) => string;
let selectionIndex: number;
let textColor: Color;

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

// Events
let target: Picker = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let index: number = 0;
let value: number = 0;

let pickerSelectEvent: PickerSelectEvent = {target, timeStamp, type, index};

widget.on({
  select: (event: PickerSelectEvent) => {}
});

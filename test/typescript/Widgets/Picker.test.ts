import {Picker, Color} from 'tabris';

let widget: Picker = new Picker();

// Properties
let borderColor: Color;
let fillColor: Color;
let itemCount: number;
let itemText: (index: number) => string;
let selectionIndex: number;

borderColor = widget.borderColor;
fillColor = widget.fillColor;
itemCount = widget.itemCount;
itemText = widget.itemText;
selectionIndex = widget.selectionIndex;

widget.borderColor = borderColor;
widget.fillColor = fillColor;
widget.itemCount = itemCount;
widget.itemText = itemText;
widget.selectionIndex = selectionIndex;

// Events
widget.on({
  selectionIndexChanged: event => selectionIndex = event.value,
  select: event => selectionIndex = event.index
});

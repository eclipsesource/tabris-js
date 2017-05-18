import {Color, Picker} from 'tabris';

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
widget.on({
  selectionIndexChanged: event => selectionIndex = event.value,
  select: event => selectionIndex = event.index
});

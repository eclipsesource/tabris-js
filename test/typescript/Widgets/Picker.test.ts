import {Picker, Color} from 'tabris';

let widget: Picker;

// Properties
let borderColor: Color;
let fillColor: Color;
let itemText: (item: any) => string;
let items: any[];
let selection: any;
let selectionIndex: number;

widget.borderColor = borderColor;
widget.fillColor = fillColor;
widget.itemText = itemText;
widget.items = items;
widget.selection = selection;
widget.selectionIndex = selectionIndex;

borderColor = widget.borderColor;
fillColor = widget.fillColor;
itemText = widget.itemText;
items = widget.items;
selection = widget.selection;
selectionIndex = widget.selectionIndex;

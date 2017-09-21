import {Color, TextView, TextViewProperties} from 'tabris';

let widget: TextView = new TextView();

// Properties
let alignment: 'center' | 'left' | 'right';
let lineSpacing: number;
let markupEnabled: boolean;
let maxLines: number|null;
let selectable: boolean;
let text: string;
let textColor: Color;

alignment = widget.alignment;
lineSpacing = widget.lineSpacing;
markupEnabled = widget.markupEnabled;
maxLines = widget.maxLines;
selectable = widget.selectable;
text = widget.text;
textColor = widget.textColor;

widget.alignment = alignment;
widget.lineSpacing = lineSpacing;
widget.markupEnabled = markupEnabled;
widget.maxLines = maxLines;
widget.selectable = selectable;
widget.text = text;
widget.textColor = textColor;

let properties: TextViewProperties = {
  alignment, lineSpacing, markupEnabled, maxLines, selectable, text, textColor
};
widget = new TextView(properties);
widget.set(properties);

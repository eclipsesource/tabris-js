import {ColorValue, TextView, TextViewTapLinkEvent, Properties, FontValue} from 'tabris';

let widget: TextView = new TextView({markupEnabled: true});

// Properties
let alignment: 'centerX' | 'left' | 'right';
let lineSpacing: number;
let markupEnabled: boolean;
let maxLines: number|null;
let selectable: boolean;
let text: string;
let textColor: ColorValue;
let font: FontValue;

alignment = widget.alignment;
lineSpacing = widget.lineSpacing;
markupEnabled = widget.markupEnabled;
maxLines = widget.maxLines;
selectable = widget.selectable;
text = widget.text;
textColor = widget.textColor;
font = widget.font;

widget.alignment = alignment;
widget.lineSpacing = lineSpacing;
widget.maxLines = maxLines;
widget.selectable = selectable;
widget.text = text;
widget.textColor = textColor;
widget.font = font;

let properties: Properties<TextView> = {
  alignment, lineSpacing, markupEnabled, maxLines, selectable, text, textColor
};
widget = new TextView(properties);
widget.set(properties);

// Events
let target: TextView = widget;
let timeStamp: number = 0;
let type: string = 'foo';
let url: string = 'http://foo.com';

let tapLinkEvent: TextViewTapLinkEvent = {target, timeStamp, type, url};

widget.onTapLink((event: TextViewTapLinkEvent) => {});

class CustomComponent extends TextView {
  public foo: string;
  constructor(props: Properties<TextView> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

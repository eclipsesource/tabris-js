import {Button, ColorValue, ImageValue, EventObject, Properties, FontValue} from 'tabris';

let widget: Button = new Button();

// Properties
let alignment: 'center' | 'left' | 'right';
let image: ImageValue;
let text: string;
let textColor: ColorValue;
let nullValue: null;
let font: FontValue;
let style: 'default' | 'elevate' | 'flat' | 'outline' | 'text';

alignment = widget.alignment;
image = widget.image as ImageValue;
nullValue = widget.image as null;
text = widget.text;
textColor = widget.textColor;
style = widget.style;

widget.alignment = alignment;
widget.image = image;
widget.image = nullValue;
widget.text = text;
widget.textColor = textColor;
font = widget.font;
style = widget.style;

let properties: Properties<typeof Button> = {alignment, image, text, textColor, font};
widget = new Button(properties);
widget.set(properties);

// Events
let target: Button = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let buttonSelectEvent: EventObject<Button> = {target, timeStamp, type};

widget.onSelect((event: EventObject<Button>) => {});

class CustomComponent extends Button {
  public foo: string;
  constructor(props: Properties<typeof Button> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

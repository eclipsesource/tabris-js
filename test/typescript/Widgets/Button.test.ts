import {Button, ColorValue, ImageValue, EventObject, Properties, FontValue} from 'tabris';

let widget: Button = new Button();

// Properties
let alignment: 'centerX' | 'left' | 'right';
let autoCapitalize: 'default' | 'none' | 'all';
let image: ImageValue;
let text: string;
let textColor: ColorValue;
let nullValue: null;
let font: FontValue;
let style: 'default' | 'elevate' | 'flat' | 'outline' | 'text';
let imageTintColor: ColorValue;
let strokeWidth: number | null = null;

alignment = widget.alignment;
autoCapitalize = widget.autoCapitalize;
image = widget.image as ImageValue;
nullValue = widget.image as null;
text = widget.text;
textColor = widget.textColor;
style = widget.style;
font = widget.font;
imageTintColor = widget.imageTintColor;

widget.alignment = alignment;
widget.autoCapitalize = autoCapitalize;
widget.image = image;
widget.image = nullValue;
widget.text = text;
widget.textColor = textColor;
widget.style = style;
widget.font = font;
widget.imageTintColor = imageTintColor;
widget.strokeWidth = strokeWidth;

let properties: Properties<Button> = {alignment, autoCapitalize, image, text, textColor, font};
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
  constructor(props: Properties<Button> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

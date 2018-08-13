import {Page, Image, EventObject, Properties} from 'tabris';

let widget: Page = new Page();

// Properties
let autoDispose: boolean;
let image: Image;
let title: string;
let nullValue: null;

autoDispose = widget.autoDispose;
image = widget.image as Image;
nullValue = widget.image as null;
title = widget.title;

widget.autoDispose = autoDispose;
widget.image = image;
widget.image = nullValue;
widget.title = title;

let properties: Properties<typeof Page> = {autoDispose, image, title};
widget = new Page(properties);
widget.set(properties);

// Events
let target: Page = widget;
let timeStamp: number = 0;
let type: string = 'foo';

let appearEvent: EventObject<Page> = {target, timeStamp, type};
let disappearEvent: EventObject<Page> = {target, timeStamp, type};

widget
  .onAppear((event: EventObject<Page>) => {})
  .onDisappear((event: EventObject<Page>) => {});

class CustomComponent extends Page {
  public foo: string;
  constructor(props: Properties<typeof Page> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

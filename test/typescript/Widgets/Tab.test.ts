import {Tab, TabFolder, Image, Properties, WidgetCollection} from 'tabris';

let widget: Tab = new Tab();

// Properties
let badge: string;
let image: Image;
let selectedImage: Image;
let title: string;
let nullValue: null;

badge = widget.badge;
image = widget.image as Image;
nullValue = widget.image as null;
selectedImage = widget.selectedImage as Image;
nullValue = widget.selectedImage as null;
title = widget.title;

widget.badge = badge;
widget.image = image;
widget.image = nullValue;
widget.selectedImage = selectedImage;
widget.selectedImage = nullValue;
widget.title = title;

let properties: Properties<typeof Tab> = {badge, image, selectedImage, title};
widget = new Tab(properties);
widget.set(properties);

widget.appendTo(new TabFolder());
widget.insertBefore(new Tab());
widget.insertAfter(new Tab());
const siblings: WidgetCollection<Tab> = widget.siblings();

class CustomComponent extends Tab {
  public foo: string;
  constructor(props: Properties<typeof Tab> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

const components: WidgetCollection<CustomComponent> = widget.siblings(CustomComponent);

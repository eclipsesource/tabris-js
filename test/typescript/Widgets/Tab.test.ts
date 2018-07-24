import {Tab, Image, TabProperties, Properties} from 'tabris';

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

let properties: TabProperties = {badge, image, selectedImage, title};
widget = new Tab(properties);
widget.set(properties);

class CustomComponent extends Tab {
  public foo: string;
  constructor(props: Properties<CustomComponent>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

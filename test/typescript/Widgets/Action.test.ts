import {Action, Image, Properties} from 'tabris';

let widget: Action = new Action();

// Properties
let placementPriority: 'low'|'normal'|'high';
let image: Image;
let title: string;
let nullValue: null;

placementPriority = widget.placementPriority;
image = widget.image as Image;
nullValue = widget.image as null;
title = widget.title;

widget.placementPriority = placementPriority;
widget.image = image;
widget.image = nullValue;
widget.title = title;

let properties: Properties<typeof Action> = {placementPriority, image, title};
widget = new Action(properties);
widget.set(properties);

class CustomComponent extends Action {
  public foo: string;
  constructor(props: Properties<typeof Action> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

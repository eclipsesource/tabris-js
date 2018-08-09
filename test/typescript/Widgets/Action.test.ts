import {Action, Image, Properties, NavigationView, Page, WidgetCollection} from 'tabris';

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

widget.appendTo(new NavigationView());
widget.insertBefore(new Action());
widget.insertAfter(new Action());
const siblings: WidgetCollection<Page|Action> = widget.siblings();
const actions: WidgetCollection<Action> = widget.siblings(Action);
const pages: WidgetCollection<Page> = widget.siblings(Page);

class CustomComponent extends Action {
  public foo: string;
  constructor(props: Properties<typeof Action> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

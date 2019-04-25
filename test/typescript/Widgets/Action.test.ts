import {Action, ImageValue, Properties, NavigationView, Page, WidgetCollection} from 'tabris';

let widget: Action = new Action();

// Properties
let placement: 'default'|'overflow'|'navigation';
let image: ImageValue;
let title: string;
let nullValue: null;

placement = widget.placement;
image = widget.image as ImageValue;
nullValue = widget.image as null;
title = widget.title;

widget.placement = placement;
widget.image = image;
widget.image = nullValue;
widget.title = title;

let properties: Properties<Action> = {placement, image, title};
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
  constructor(props: Properties<Action> & Partial<Pick<CustomComponent, 'foo'>>) { super(props); }
}

new CustomComponent({foo: 'bar'}).set({foo: 'bar'});

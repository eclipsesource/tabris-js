import {Action, Image, ActionProperties} from 'tabris';

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

let properties: ActionProperties = {placementPriority, image, title};
widget = new Action(properties);
widget.set(properties);

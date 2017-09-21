import {Action, Image, ActionProperties} from 'tabris';

let widget: Action = new Action();

// Properties
let placementPriority: 'low'|'normal'|'high';
let image: Image;
let title: string;


placementPriority = widget.placementPriority;
image = widget.image;
title = widget.title;

widget.placementPriority = placementPriority;
widget.image = image;
widget.title = title;

let properties: ActionProperties = {placementPriority, image, title};
widget = new Action(properties);
widget.set(properties);

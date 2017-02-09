import {Action, Image} from 'tabris';

let widget: Action;

// Properties
let placementPriority: 'low'|'normal'|'high';
let image: Image;
let title: string;


widget.placementPriority = placementPriority;
widget.image = image;
widget.title = title;

placementPriority = widget.placementPriority;
image = widget.image;
title = widget.title;

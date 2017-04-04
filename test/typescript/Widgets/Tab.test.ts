import {Tab, Image} from 'tabris';

let widget: Tab = new Tab();

// Properties
let badge: string;
let image: Image;
let selectedImage: Image;
let title: string;

badge = widget.badge;
image = widget.image;
selectedImage = widget.selectedImage;
title = widget.title;

widget.badge = badge;
widget.image = image;
widget.selectedImage = selectedImage;
widget.title = title;

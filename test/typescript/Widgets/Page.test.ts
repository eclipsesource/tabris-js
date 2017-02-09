import {Page, Image} from 'tabris';

let widget: Page;

// Properties
let autoDispose: boolean;
let image: Image;
let title: string;

widget.autoDispose = autoDispose;
widget.image = image;
widget.title = title;

autoDispose = widget.autoDispose;
image = widget.image;
title = widget.title;

import {Page, Image} from 'tabris';

let widget: Page = new Page();

// Properties
let autoDispose: boolean;
let image: Image;
let title: string;

autoDispose = widget.autoDispose;
image = widget.image;
title = widget.title;

widget.autoDispose = autoDispose;
widget.image = image;
widget.title = title;

import {Composite, Stack, StackLayout} from 'tabris';

let alignment: 'left'|'centerX'|'stretchX'|'right' = 'left'
let widget: Stack = new Stack();
widget = new Stack({padding: 2});
widget = new Stack({padding: {left: 2, top: 2, right: 2, bottom: 2}});
widget = new Stack({spacing: 2, alignment});
let composite: Composite = widget;
let layout: StackLayout = widget.layout;
let spacing: number = widget.spacing;
alignment = widget.alignment;

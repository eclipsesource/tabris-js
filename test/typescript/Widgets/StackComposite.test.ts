import {Composite, StackComposite, StackLayout} from 'tabris';

let widget: StackComposite = new StackComposite();
widget = new StackComposite({padding: 2});
widget = new StackComposite({padding: {left: 2, top: 2, right: 2, bottom: 2}});
widget = new StackComposite({spacing: 2});
let composite: Composite = widget;
let layout: StackLayout = widget.layout;
let spacing: number = widget.spacing;
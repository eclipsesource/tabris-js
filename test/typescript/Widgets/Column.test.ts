import {Composite, Column, ColumnLayout} from 'tabris';

let widget: Column = new Column();
widget = new Column({padding: 2});
widget = new Column({padding: {left: 2, top: 2, right: 2, bottom: 2}});
widget = new Column({spacing: 2});
let composite: Composite = widget;
let layout: ColumnLayout = widget.layout;
let spacing: number = widget.spacing;
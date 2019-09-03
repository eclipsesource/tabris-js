import {Composite, Row, RowLayout} from 'tabris';

let alignment: 'top' | 'centerY' | 'stretchY' | 'bottom' | 'baseline' = 'top'
let widget: Row = new Row();
widget = new Row({padding: 2});
widget = new Row({padding: {left: 2, top: 2, right: 2, bottom: 2}});
widget = new Row({spacing: 2, alignment});
let composite: Composite = widget;
let layout: RowLayout = widget.layout;
let spacing: number = widget.spacing;
alignment = widget.alignment;
alignment = layout.alignment;

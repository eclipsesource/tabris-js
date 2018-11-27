import {Layout, ConstraintLayout, StackLayout, Composite, BoxDimensions} from 'tabris';

let layout: Layout = ConstraintLayout.default
let constraintLayout: ConstraintLayout = ConstraintLayout.default;
let padding: BoxDimensions | number = layout.padding;
constraintLayout = new ConstraintLayout();
constraintLayout = new ConstraintLayout({padding: 16});
constraintLayout = new ConstraintLayout({padding: {left: 10, top: 10, right: 10, bottom: 10}});
let composite: Composite = new Composite({layout});
let stackLayout: StackLayout = StackLayout.default;
stackLayout = new StackLayout({padding: 16});
stackLayout = new StackLayout({padding: {left: 10, top: 10, right: 10, bottom: 10}});
stackLayout = new StackLayout({spacing: 12});

layout = composite.layout = layout;
composite.layout = null;

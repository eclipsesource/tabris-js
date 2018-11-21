import {Layout, ConstraintLayout, ColumnLayout, Composite, BoxDimensions} from 'tabris';

let layout: Layout = ConstraintLayout.default
let constraintLayout: ConstraintLayout = ConstraintLayout.default;
let padding: BoxDimensions | number = layout.padding;
constraintLayout = new ConstraintLayout();
constraintLayout = new ConstraintLayout({padding: 16});
constraintLayout = new ConstraintLayout({padding: {left: 10, top: 10, right: 10, bottom: 10}});
let composite: Composite = new Composite({layout});
let columnLayout: ColumnLayout = ColumnLayout.default;
columnLayout = new ColumnLayout({padding: 16});
columnLayout = new ColumnLayout({padding: {left: 10, top: 10, right: 10, bottom: 10}});
columnLayout = new ColumnLayout({spacing: 12});

layout = composite.layout = layout;
composite.layout = null;

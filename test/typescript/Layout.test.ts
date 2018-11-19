import {Layout, ConstraintLayout, ColumnLayout, Composite} from 'tabris';

let layout: Layout = ConstraintLayout.default
let constraintLayout: ConstraintLayout = ConstraintLayout.default;
let composite: Composite = new Composite({layout});
let columnLayout: ColumnLayout = ColumnLayout.default;
layout = composite.layout = layout;
composite.layout = null;

import {Layout, ConstraintLayout, ColumnLayout, Composite} from 'tabris';

let layout: Layout = ConstraintLayout.create();
let constraintLayout: ConstraintLayout = ConstraintLayout.create();
let composite: Composite = new Composite({layout});
let columnLayout: ColumnLayout = ColumnLayout.create();
layout = composite.layout = layout;
composite.layout = null;

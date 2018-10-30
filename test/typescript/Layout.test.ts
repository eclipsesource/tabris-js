import {Layout, ColumnLayout, Composite} from 'tabris';

let layout: Layout = Layout.default();
let composite: Composite = new Composite({layout});
let columnLayout: ColumnLayout = Layout.column();
layout = composite.layout = layout;
composite.layout = null;

import {Layout, ConstraintLayout, StackLayout, Composite, BoxDimensions} from 'tabris';

let layout: Layout|null = ConstraintLayout.default
let constraintLayout: ConstraintLayout = ConstraintLayout.default;
let alignment: 'left'|'centerX'|'stretchX'|'right' = 'left';
constraintLayout = new ConstraintLayout();
let composite: Composite = new Composite({layout});
let stackLayout: StackLayout = StackLayout.default;
stackLayout = new StackLayout({alignment});

layout = composite.layout;
alignment = stackLayout.alignment;

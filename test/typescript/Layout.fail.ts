import {Layout, ConstraintLayout, BoxDimensions} from 'tabris';

let layout: Layout = ConstraintLayout.default
let constraintLayout: ConstraintLayout = ConstraintLayout.default;
let padding: BoxDimensions = layout.padding;

layout.padding = padding;

/*Expected
(7,
read-only
*/

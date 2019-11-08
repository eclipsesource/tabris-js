import {
  Percent,
  PercentValue,
  Constraint,
  Widget,
  Composite,
  LayoutData,
  SiblingReference,
  ConstraintValue,
  ConstraintArray,
  ConstraintLikeObject
} from 'tabris';

// Related types
let num: number = 23;
let percent: Percent = new Percent(0);
let reference: SiblingReference|Percent = new Composite();
let widget: Widget = new Composite();
let percentValue: PercentValue = {percent: 50};
let siblingReference: SiblingReference = widget;
siblingReference = '#foo';
siblingReference = Constraint.prev;
siblingReference = Constraint.next;
siblingReference = LayoutData.prev;
siblingReference = LayoutData.next;
let constraintArray: ConstraintArray = ['50%', 0];
constraintArray = [siblingReference, 0];
let constraintLikeObject: ConstraintLikeObject = {reference: siblingReference, offset: 0};
constraintLikeObject = {reference: siblingReference};
constraintLikeObject = {reference: percentValue};
constraintLikeObject = {offset: 10};
if (reference instanceof Percent) {
  percent = reference;
} else if (reference instanceof Widget) {
  widget = reference;
} else if (typeof reference === 'string') {
  const str: string = reference;
} else if (reference === Constraint.prev) {
  let sym: typeof Constraint.prev = reference;
} else if (reference === Constraint.next) {
  let sym: typeof Constraint.next = reference;
} else if (reference === Constraint.prev) {
  let sym: typeof LayoutData.prev = reference;
} else if (reference === Constraint.prev) {
  let sym: typeof LayoutData.prev = reference;
}

// Constructor
let constraint: Constraint = new Constraint(new Percent(0), 0);
constraint = new Constraint(siblingReference, 0);

// Instance
num = constraint.offset;
percent = constraint.reference as Percent;
reference = constraint.reference;
siblingReference = constraint.reference as SiblingReference;
constraintArray = constraint.toArray();
let bool: boolean = constraint.equals(constraint);

// ConstraintValue
let constraintValue: ConstraintValue = constraint;
constraintValue = 23;
constraintValue = siblingReference;
constraintValue = percentValue;
constraintValue = 'auto';
constraintValue = constraintArray;

// Statics
constraint = Constraint.from(constraintValue);

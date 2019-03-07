import {
  Percent,
  PercentValue,
  Constraint,
  Widget,
  Composite,
  SiblingReference,
  SiblingReferenceValue,
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

let siblingReferenceValue: SiblingReferenceValue = (x: Widget) => true;
let constraintArray: ConstraintArray = ['50%'];
constraintArray = ['50%', 0, 1];
let constraintLikeObject: ConstraintLikeObject = {};
constraintLikeObject = {reference: 10};
constraintLikeObject = {percent: 10};

// Constructor
let constraint: Constraint = new Constraint(new Percent(0));
constraint = new Constraint();
constraint = new Constraint(new Percent(0), 0, 0);
constraint = new Constraint(null, null);
constraint = new Constraint(undefined, undefined);
constraint = new Constraint((x: Widget) => true, 23);
constraint = new Constraint(new Percent(0), '0');
constraint = new Constraint('auto');
constraint = new Constraint(new Percent(0), 'auto');
constraint = new Constraint(percentValue, 0);

// Instance
let auto = constraint.offset as 'auto';
let percentLikeObject = constraint.reference as PercentLikeObject;
let stringArray = constraint.toArray() as [string, string];

// ConstraintValue
let constraintValue: ConstraintValue = null;
constraintValue = undefined;
constraintValue = {};
constraintValue = new Date();

// Statics
Constraint.from();
Constraint.from(null);
Constraint.from(undefined);
Constraint.from({});
Constraint.from(new Date());
Constraint.from(constraintValue, 2);

/*Expected
(22,
not assignable to type
(23,
(24,
not assignable to type
(25,
not assignable to type
(26,
not assignable to type
(27,
not assignable to type
(30,
Expected 2 arguments
(31,
Expected 2 arguments
(32,
Expected 2 arguments
(35,
not assignable to parameter of type
(36,
not assignable to parameter of type 'number'
(37,
Expected 2 arguments
(38,
not assignable to parameter of type 'number'
(39,
not assignable to parameter of type
(42,
(43,
Cannot find name 'PercentLikeObject'
(44,
(49,
not assignable to type 'ConstraintValue'
(50,
not assignable to type 'ConstraintValue'
(53,
Expected 1 argument
(56,
not assignable to parameter of type 'ConstraintValue'
(57,
not assignable to parameter of type 'ConstraintValue'
(58,
Expected 1 argument
*/
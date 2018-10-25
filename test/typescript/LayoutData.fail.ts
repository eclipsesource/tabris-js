import {
  Constraint,
  LayoutData,
  LayoutDataValue,
  SiblingReference,
  SiblingReferenceValue,
  ConstraintValue,
  Offset
} from 'tabris';

// Related types
let siblingReference: SiblingReference|'auto';
let siblingReferenceValue: SiblingReferenceValue|'auto';
let constraintValue: ConstraintValue|'auto';
let constraint: Constraint|'auto';
let num: Offset|'auto';

// Constructor
let layoutData: LayoutData = new LayoutData();
layoutData = new LayoutData({left: constraintValue});
layoutData = new LayoutData({right: constraintValue});
layoutData = new LayoutData({top: constraintValue});
layoutData = new LayoutData({bottom: constraintValue});
layoutData = new LayoutData({width: siblingReference});
layoutData = new LayoutData({height: siblingReference});
layoutData = new LayoutData({baseline: constraint});
layoutData = new LayoutData({centerX: siblingReference});
layoutData = new LayoutData({centerY: siblingReference});
layoutData = new LayoutData({}, {});

// Instance
num = layoutData.left;
num = layoutData.right;
num = layoutData.top;
num = layoutData.bottom;
siblingReferenceValue = layoutData.width;
siblingReferenceValue = layoutData.height;
siblingReferenceValue = layoutData.centerX;
siblingReferenceValue = layoutData.centerY;
constraint = layoutData.baseline;

// LayoutDataValue
let layoutDataValue: LayoutDataValue = null;
layoutDataValue = undefined;
layoutDataValue = new Date();

// Statics
LayoutData.from();
LayoutData.from(null);
LayoutData.from(undefined);
LayoutData.from(new Date());
LayoutData.from(constraintValue, 2);

/*Expected
(19,
Expected 1 arguments, but got 0.
(20,
not assignable to parameter of type 'LayoutDataProperties'
(21,
not assignable to parameter of type 'LayoutDataProperties'
(22,
not assignable to parameter of type 'LayoutDataProperties'
(23,
not assignable to parameter of type 'LayoutDataProperties'
(24,
not assignable to parameter of type 'LayoutDataProperties'
(25,
not assignable to parameter of type 'LayoutDataProperties'
(26,
not assignable to parameter of type 'LayoutDataProperties'
(27,
not assignable to parameter of type 'LayoutDataProperties'
(28,
not assignable to parameter of type 'LayoutDataProperties'
(29,
Expected 1 arguments
(32,
not assignable
(33,
not assignable
(34,
not assignable
(35,
not assignable
(36,
not assignable to type 'SiblingReference'
(37,
not assignable to type 'SiblingReference'
(38,
not assignable to type 'SiblingReference'
(39,
not assignable to type 'SiblingReference'
(40,
Type 'SiblingReference' is not assignable to type '"auto" | Constraint'
(45,
Type 'Date'
(48,
Expected 1 arguments
(51,
Type 'Date'
(52,
Expected 1 argument
*/
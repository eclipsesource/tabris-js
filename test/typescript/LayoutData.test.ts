import {
  Constraint,
  Composite,
  LayoutData,
  LayoutDataValue,
  SiblingReference,
  SiblingReferenceValue,
  ConstraintValue,
  Offset
} from 'tabris';

// Related types
let siblingReference: SiblingReference|'auto' = new Composite();
let siblingReferenceValue: SiblingReferenceValue|'auto' = new Composite();
let constraintValue: ConstraintValue|'auto' = 23;
let constraint: Constraint|'auto' = new Constraint(siblingReference, 0);
let num: Offset|'auto' = 23;

// Constructor
let layoutData: LayoutData = new LayoutData({});
layoutData = new LayoutData({
  left: constraint,
  right: constraint,
  top: constraint,
  bottom: constraint,
  width: num,
  height: num,
  baseline: siblingReference,
  centerX: num,
  centerY: num
});

// Instance
constraint = layoutData.left;
constraint = layoutData.right;
constraint = layoutData.top;
constraint = layoutData.bottom;
num = layoutData.width;
num = layoutData.height;
num = layoutData.centerX;
num = layoutData.centerY;
siblingReference = layoutData.baseline;
let bool: boolean = layoutData.equals(layoutData);

// LayoutDataValue
let layoutDataValue: LayoutDataValue = {};
layoutDataValue = {
  left: constraintValue,
  right: constraintValue,
  top: constraintValue,
  bottom: constraintValue,
  width: num,
  height: num,
  baseline: siblingReferenceValue,
  centerX: num,
  centerY: num
};
layoutDataValue = 'center';
layoutDataValue = 'stretch';
layoutDataValue = 'stretchX';
layoutDataValue = 'stretchY';

// Statics
layoutData = LayoutData.from(layoutDataValue);
layoutData = LayoutData.center;
layoutData = LayoutData.stretch;
layoutData = LayoutData.stretchX;
layoutData = LayoutData.stretchY;

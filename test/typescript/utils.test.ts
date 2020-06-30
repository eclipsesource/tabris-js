import {checkType} from 'tabris';

let value: unknown = {};

let date: Date = checkType(value, Date);
const inferredString = checkType(value, String);
let string: string = inferredString
const inferredNumber = checkType(value, Number);
let number: number = inferredNumber;
const inferredBoolean = checkType(value, Boolean);
let boolean: boolean = inferredBoolean;

date = checkType(value, Date, {nullable: true});
date = checkType(value, Date, {name: 'date'});
let nothing: void = checkType(value, Date, checked => date = checked);
nothing = checkType(value, String, checked => string = checked);
nothing = checkType(value, Number, checked => number = checked);
nothing = checkType(value, Boolean, checked => boolean = checked);

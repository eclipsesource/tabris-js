import 'tabris';

interface A {
  stringProp: string;
}

interface B {
  numberProp: number;
}

interface C {
  objectProp: Object;
}

interface D {
  functionProp: Function;
}

interface E {
  anyProp: any;
}

let a: A = { stringProp: '' };
let b: B = { numberProp: 42 };
let c: C = { objectProp: {} };
let d: D = { functionProp: () => { } };
let e: E = { anyProp: 42 };

let aAndB: A & B = Object.assign(a, b);
let aAndBAndC: A & B & C = Object.assign(a, b, c);
let aAndBAndCAndD: A & B & C & D = Object.assign(a, b, c, d);
let aAndBAndCAndDAndE: any = Object.assign(a, b, c, d, e);

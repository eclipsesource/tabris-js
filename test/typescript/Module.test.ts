import { Module } from 'tabris';

let m: Module = new Module('my-module', null, {foo: 'bar'});
m = new Module('my-module', m, (a, b, c, d, e) => {
  const otherM: Module = a;
  const otherExports: {} = b;
  const otherRquire: (id: string) => unknown = c;
  const str1: string = d;
  const str2: string = e;
});

let unknown: unknown = Module.getSourceMap('foo.js');
unknown = Module.execute('1+2;', 'foo.js');
unknown = Module.readJSON('foo.json');
unknown = Module.createRequire('/foo/bar')('./baz');
let str: string = Module.load('foo.js');
const loader = Module.createLoader('foo.js');
loader(m, {}, (x) => ({[x]: 'foo'}), 'foo.js', 'foo.js');
Module.define('/foo/bar', {});
Module.define('/foo/bar', null);

// global definitions

m = module;
unknown = require('tabris');
const obj: object = exports;
str = __dirname;
str = __filename;

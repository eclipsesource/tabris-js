import {expect, spy} from '../test';
import checkType from '../../src/tabris/checkType';

describe('checkType', () => {

  it('checks primitives positive', () => {
    expect(() => {
      checkType(-1, Number);
      checkType(0, Number);
      checkType(1, Number);
      checkType(true, Boolean);
      checkType(false, Boolean);
      checkType('', String);
      checkType('foo', String);
    }).not.to.throw();
  });

  it('passes through value', () => {
    const number = Math.random();
    const str = 'foo' + number ;
    const boolean = true;
    const date = new Date();

    expect(checkType(number, Number)).to.equal(number);
    expect(checkType(str, String)).to.equal(str);
    expect(checkType(boolean, Boolean)).to.equal(boolean);
    expect(checkType(date, Date)).to.equal(date);
  });

  it('calls callback with value', () => {
    const number = Math.random();
    const str = 'foo' + number ;
    const boolean = true;
    const date = new Date();
    const cb = spy();

    checkType(number, Number, cb);
    checkType(str, String, cb);
    checkType(boolean, Boolean, cb);
    checkType(date, Date, cb);

    expect(cb).callCount(4);
    expect(cb).to.have.been.calledWith(number);
    expect(cb).to.have.been.calledWith(str);
    expect(cb).to.have.been.calledWith(boolean);
    expect(cb).to.have.been.calledWith(date);
  });

  it('checks primitives negative', () => {
    expect(() => checkType('', Number)).
      to.throw('Expected "" to be a number, got string');
    expect(() => checkType('foo', Boolean)).
      to.throw('Expected "foo" to be a boolean, got string');
    expect(() => checkType(23, Boolean)).
      to.throw('Expected 23 to be a boolean, got number');
    expect(() => checkType(false, String)).
      to.throw('Expected false to be a string, got boolean');
    expect(() => checkType(NaN, Number)).
      to.throw('Expected NaN to be a valid number, got NaN');
    expect(() => checkType(Infinity, Number)).
      to.throw('Expected Infinity to be a finite number, got Infinity');
    expect(() => checkType(-Infinity, Number)).
      to.throw('Expected -Infinity to be a finite number, got -Infinity');
    expect(() => checkType(false, Date)).
      to.throw('Expected false to be of type Date, got boolean');
  });

  it('checks objects positive', () => {
    expect(() => {
      checkType([], Array);
      checkType({}, Object);
      checkType([], Object);
      checkType(new Date(), Date);
      checkType(() => null, Function);
      checkType(class {}, Function);
      checkType(function() { }, Function);
    }).not.to.throw();
  });

  it('checks objects negative', () => {
    expect(() => checkType({}, Array)).to.throw('Expected {} to be an array, got Object.');
    expect(() => checkType(new Date(), Function)).to.throw('Expected Date to be a function, got Date.');
  });

  it('null and undefined never pass by default', () => {
    expect(() => checkType(null, Number)).
      to.throw('Expected null to be a number, got null');
    expect(() => checkType(undefined, Number)).
      to.throw('Expected undefined to be a number, got undefined');
    expect(() => checkType(null, Date)).
      to.throw('Expected null to be of type Date, got null');
    expect(() => checkType(undefined, Date)).
      to.throw('Expected undefined to be of type Date, got undefined');
  });

  it('null and undefined pass when nullable', () => {
    expect(() => {
      checkType(null, Number, {nullable: true});
      checkType(undefined, Number, {nullable: true});
      checkType(null, String, {nullable: true});
      checkType(undefined, String, {nullable: true});
      checkType(null, Boolean, {nullable: true});
      checkType(undefined, Boolean, {nullable: true});
      checkType(null, Function, {nullable: true});
      checkType(undefined, Function, {nullable: true});
      checkType(null, Object, {nullable: true});
      checkType(undefined, Object, {nullable: true});
      checkType(null, Date, {nullable: true});
      checkType(undefined, Date, {nullable: true});
    }).not.to.throw();
  });

  it('boxed types never pass', () => {
    // eslint-disable-next-line no-new-wrappers
    expect(() => checkType(new Number(23), Number)).to.throw('Boxed values are forbidden');
    // eslint-disable-next-line no-new-wrappers
    expect(() => checkType(new String('foo'), String)).to.throw('Boxed values are forbidden');
    // eslint-disable-next-line no-new-wrappers
    expect(() => checkType(new Boolean(true), Boolean)).to.throw('Boxed values are forbidden');
  });

  it('uses given value name', () => {
    expect(() => checkType('', Number, {name: 'parameter 2'})).
      to.throw('Expected parameter 2 to be a number, got string');
    expect(() => checkType('', Number, {name: 'option "foo"'})).
      to.throw('Expected option "foo" to be a number, got string');
  });

});

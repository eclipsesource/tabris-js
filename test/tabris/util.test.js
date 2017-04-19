import {expect} from '../test';
import {pick, omit, isObject} from '../../src/tabris/util';

describe('util', function() {

  describe('pick', function() {

    it('returns a copy', function() {
      let original = {a: 1};

      let result = pick(original, ['a']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are in the list', function() {
      let result = pick({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

      expect(result).to.eql({a: 1, c: 3});
    });

  });

  describe('omit', function() {

    it('returns a copy', function() {
      let original = {a: 1};

      let result = omit(original, ['b']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are not in the list', function() {
      let result = omit({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

      expect(result).to.eql({b: 2});
    });

  });

  describe('isObject', function() {

    it('returns true for objects', function() {
      expect(isObject({})).to.be.true;
      expect(isObject(new Date())).to.be.true;
    });

    it('returns false for other types', function() {
      expect(isObject(null)).to.be.false;
      expect(isObject(undefined)).to.be.false;
      expect(isObject(23)).to.be.false;
      expect(isObject('foo')).to.be.false;
    });

  });

});

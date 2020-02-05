import {expect} from '../test';
import {
  pick,
  omit,
  isObject,
  capitalizeFirstChar,
  normalizePath,
  normalizePathUrl,
  checkNumber,
  proxify
} from '../../src/tabris/util';

describe('util', function() {

  describe('pick', function() {

    it('returns a copy', function() {
      const original = {a: 1};

      const result = pick(original, ['a']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are in the list', function() {
      const result = pick({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

      expect(result).to.eql({a: 1, c: 3});
    });

  });

  describe('omit', function() {

    it('returns a copy', function() {
      const original = {a: 1};

      const result = omit(original, ['b']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are not in the list', function() {
      const result = omit({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

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

  describe('capitalizeFirstChar', function() {

    it('replaces first letter with upper case', function() {
      expect(capitalizeFirstChar('f')).to.equal('F');
      expect(capitalizeFirstChar('foo')).to.equal('Foo');
      expect(capitalizeFirstChar('fooBar')).to.equal('FooBar');
      expect(capitalizeFirstChar('FOO')).to.equal('FOO');
    });

    it('does not change empty string', function() {
      expect(capitalizeFirstChar('')).to.equal('');
    });

  });

  describe('normalizePath', function() {

    it('throws if path is missing or not a string', function() {
      expect(() => normalizePath()).to.throw(Error, 'must be a string');
      expect(() => normalizePath(null)).to.throw(Error, 'must be a string');
      expect(() => normalizePath(23)).to.throw(Error, 'must be a string');
    });

    it('throws if path is the empty string', function() {
      expect(() => normalizePath('')).to.throw(Error, 'must not be empty');
    });

    it('accepts absolute paths', function() {
      expect(normalizePath('/foo/bar')).to.equal('/foo/bar');
    });

    it('accepts relative paths', function() {
      expect(normalizePath('foo/bar')).to.equal('foo/bar');
      expect(normalizePath('./foo/bar')).to.equal('foo/bar');
    });

    it('accepts current path', function() {
      expect(normalizePath('./')).to.equal('.');
    });

    it('accepts root path', function() {
      expect(normalizePath('/')).to.equal('/');
    });

    it('eliminates redundant slashes and dots', function() {
      expect(normalizePath('//foo///././bar/')).to.equal('/foo/bar');
      expect(normalizePath('/foo/../bar')).to.equal('/bar');
      expect(normalizePath('/foo/..')).to.equal('/');
    });

    it('throws for paths starting with ..', function() {
      expect(normalizePath('//foo///././bar/')).to.equal('/foo/bar');
      expect(() => normalizePath('../foo')).to.throw();
    });

  });

  describe('normalizePathUrl', function() {

    it('throws if URL is missing or not a string', function() {
      expect(() => normalizePathUrl()).to.throw(Error, 'must be a string');
      expect(() => normalizePathUrl(null)).to.throw(Error, 'must be a string');
      expect(() => normalizePathUrl(23)).to.throw(Error, 'must be a string');
    });

    it('throws if URL path is empty', function() {
      expect(() => normalizePathUrl('http://')).to.throw(Error, 'must not be empty');
      expect(() => normalizePathUrl('')).to.throw(Error, 'must not be empty');
    });

    it('eliminates redundant slashes and dots from paths', function() {
      expect(normalizePathUrl('//foo///././bar/')).to.equal('/foo/bar');
      expect(normalizePathUrl('foo///././bar/')).to.equal('foo/bar');
    });

    it('eliminates redundant slashes and dots from URLs', function() {
      expect(normalizePathUrl('http://foo///././bar/')).to.equal('http://foo/bar');
      expect(normalizePathUrl('file:///foo///././bar/')).to.equal('file:///foo/bar');
      expect(normalizePathUrl('ms-appdata:///foo///././bar/')).to.equal('ms-appdata:///foo/bar');
    });

    it('accepts base64 URLs', function() {
      expect(normalizePathUrl('data:image/png;base64,abc///def')).to.equal('data:image/png;base64,abc///def');
    });

  });

  describe('checkNumber', function() {

    it('throws for invalid numbers', function() {
      expect(() => checkNumber('foo')).to.throw('Invalid number foo');
      expect(() => checkNumber(NaN)).to.throw('Invalid number NaN');
      expect(() => checkNumber(Infinity)).to.throw('Invalid number Infinity');
    });

    it('throws for numbers out of range', function() {
      expect(() => checkNumber(5, [0, 4])).to.throw('Number 5 out of range');
      expect(() => checkNumber(-1, [0, Infinity])).to.throw('Number -1 out of range');
    });

    it('does not throw for valid numbers', function() {
      expect(() => checkNumber(5, [0, Infinity])).not.to.throw();
      expect(() => checkNumber(-5, [-Infinity, 5])).not.to.throw();
      expect(() => checkNumber(0, [0, 5])).not.to.throw();
      expect(() => checkNumber(5, [0, 5])).not.to.throw();
      expect(() => checkNumber(4, [0, 5])).not.to.throw();
    });

    it('prepends error message', function() {
      expect(() => {
        checkNumber('foo', [-Infinity, Infinity], 'Invalid bar');
      }).to.throw('Invalid bar: Invalid number foo');
      expect(() => {
        checkNumber(6, [-1, 5], 'Invalid bar');
      }).to.throw('Invalid bar: Number 6 out of range');
    });

  });

  describe('proxify', function() {

    class Test {
      constructor() {
        this.a = 1;
      }
    }

    let org, proxy;

    beforeEach(function() {
      org = new Test();
      proxy = proxify(() => org);
    });

    it('returns equal-but-not-identical object', function() {
      expect(proxy).to.deep.equal(org);
      expect(proxy === org).be.false;
    });

    it('delegates set', function() {
      proxy.b = 2;
      expect(proxy).to.deep.equal(org);
    });

    it('supports instanceof', function() {
      expect(proxy instanceof Test).to.be.true;
    });

    it('supports equals', function() {
      expect(proxy === proxy).to.be.true;
    });

    it('allows switching target', function() {
      const backup = org;
      org = {b: 2};
      proxy.c = 3;

      expect(proxy).to.deep.equal(org);
      expect(proxy).not.to.deep.equal(backup);
      expect(proxy instanceof Test).to.be.false;
    });

  });

});

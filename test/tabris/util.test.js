import {expect} from '../test';
import {pick, omit, isObject, capitalizeFirstChar, normalizePath, normalizePathUrl} from '../../src/tabris/util';

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

    it('throws if path contains `..` segments', function() {
      expect(() => normalizePath('/foo/../bar')).to.throw(Error, 'must not contain \'..\'');
      expect(() => normalizePath('/foo/..')).to.throw(Error, 'must not contain \'..\'');
      expect(() => normalizePath('/../foo')).to.throw(Error, 'must not contain \'..\'');
      expect(() => normalizePath('../foo')).to.throw(Error, 'must not contain \'..\'');
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

    it('throws if URL or path contains `..` segments', function() {
      expect(() => normalizePathUrl('foo://foo/../bar')).to.throw(Error, 'must not contain \'..\'');
      expect(() => normalizePathUrl('/../foo')).to.throw(Error, 'must not contain \'..\'');
      expect(() => normalizePathUrl('../foo')).to.throw(Error, 'must not contain \'..\'');
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

});

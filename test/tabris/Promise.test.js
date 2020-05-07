import {expect} from '../test';
import PromisePolyfill, {isPending, isRejected, getPromiseResult} from '../../src/tabris/Promise';

describe('Promise', function() {

  let originalPromise;

  before(function() {
    originalPromise = global.Promise;
    global.Promise = PromisePolyfill;
  });

  after(function() {
    global.Promise = originalPromise;
  });

  describe('constructor', function() {

    it('returns a pending promise', function() {
      const promise = new Promise(() => {});
      expect(isPending(promise)).to.be.true;
    });

  });

  describe('instance', function() {

    it('resolves when resolve function is called', function() {
      const promise = new Promise((resolve) => setTimeout(() => resolve(23)));
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

    it('rejects when reject function is called', function() {
      const promise = new Promise((resolve, reject) => setTimeout(() => reject('message')));
      return promise.then(expectFail, (error) => {
        expect(error).to.equal('message');
      });
    });

    it('does not expose internal properties', function() {
      const promise = new Promise(() => {});
      expect(Object.keys(promise)).to.be.empty;
    });

  });

  describe('then()', function() {

    it('returns pending promise', function() {
      const promise = new Promise.resolve().then(() => 23);
      expect(isPending(promise)).to.be.true;
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

  });

  describe('catch()', function() {

    it('returns pending promise', function() {
      const promise = new Promise.reject().catch(() => 23);
      expect(isPending(promise)).to.be.true;
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

  });

  describe('resolve()', function() {

    it('returns resolved promise', function() {
      const promise = Promise.resolve(23);
      expect(isPending(promise)).to.be.false;
      expect(isRejected(promise)).to.be.false;
      expect(getPromiseResult(promise)).to.equal(23);
    });

    it('returns promise resolved with null', function() {
      const promise = Promise.resolve(null);
      expect(isPending(promise)).to.be.false;
      expect(isRejected(promise)).to.be.false;
      expect(getPromiseResult(promise)).to.equal(null);
    });

  });

  describe('reject()', function() {

    it('returns rejected Promise', function() {
      const promise = Promise.reject('error');
      expect(isRejected(promise)).to.be.true;
      expect(getPromiseResult(promise)).to.equal('error');
    });

  });

});

function expectFail() {
  throw new Error('expected to fail');
}

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
      let promise = new Promise(() => {});
      expect(isPending(promise)).to.be.true;
    });

  });

  describe('instance', function() {

    it('resolves when resolve function is called', function() {
      let promise = new Promise((resolve) => setTimeout(() => resolve(23)));
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

    it('rejects when reject function is called', function() {
      let promise = new Promise((resolve, reject) => setTimeout(() => reject('message')));
      return promise.then(expectFail, (error) => {
        expect(error).to.equal('message');
      });
    });

    it('does not expose internal properties', function() {
      let promise = new Promise(() => {});
      expect(Object.keys(promise)).to.be.empty;
    });

  });

  describe('then()', function() {

    it('returns pending promise', function() {
      let promise = new Promise.resolve().then(() => 23);
      expect(isPending(promise)).to.be.true;
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

  });

  describe('catch()', function() {

    it('returns pending promise', function() {
      let promise = new Promise.reject().catch(() => 23);
      expect(isPending(promise)).to.be.true;
      return promise.then((result) => {
        expect(result).to.equal(23);
      });
    });

  });

  describe('resolve()', function() {

    it('returns resolved promise', function() {
      let promise = Promise.resolve(23);
      expect(isPending(promise)).to.be.false;
      expect(isRejected(promise)).to.be.false;
      expect(getPromiseResult(promise)).to.equal(23);
    });

  });

  describe('reject()', function() {

    it('returns rejected Promise', function() {
      let promise = Promise.reject('error');
      expect(isRejected(promise)).to.be.true;
      expect(getPromiseResult(promise)).to.equal('error');
    });

  });

});

function expectFail() {
  throw new Error('expected to fail');
}

/* eslint-disable no-unused-vars */
import {expect, stub, restore, mockTabris} from '../test';
import PromisePolyfill, {isPending, isRejected, getPromiseResult} from '../../src/tabris/Promise';
import ClientMock from './ClientMock';

describe('Promise', function() {

  /** @type {ClientMock} */
  let client;
  let originalPromise;

  before(function() {
    originalPromise = global.Promise;
    global.Promise = PromisePolyfill;
    client = new ClientMock();
    mockTabris(client);
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

    beforeEach(() => {
      stub(console, 'error');
      stub(console, 'warn');
    });
    afterEach(restore);

    it('returns rejected Promise', function(done) {
      const promise = Promise.reject('error');
      expect(isRejected(promise)).to.be.true;
      expect(getPromiseResult(promise)).to.equal('error');
      setTimeout(done, 0); // prevent uncaught rejection error interfering with other tests
    });

    it('does not log caught rejections', function(done) {
      Promise.reject().catch(e => {});
      Promise.reject('foo').catch(e => {});
      Promise.reject(new Error()).catch(e => {});

      setTimeout(() => {
        expect(console.error).not.to.have.been.called;
        done();
      }, 0);
    });

    describe('logs uncaught rejections', function() {

      it('without reason', function(done) {
        Promise.reject();

        setTimeout(() => {
          const pattern = /^Uncaught promise rejection \(id: .*\)/;
          expect(console.error).to.have.been.calledOnce;
          expect(console.error).to.have.been.calledWithMatch(pattern);
          done();
        }, 0);
      });

      it('with string reason', function(done) {
        Promise.reject('some reason');

        setTimeout(() => {
          const pattern = /^Uncaught promise rejection \(id: .*\)/;
          expect(console.error).to.have.been.calledOnce;
          expect(console.error).to.have.been.calledWithMatch(pattern);
          done();
        }, 0);
      });

      it('with Error reason', function(done) {
        const error = new Error();
        Promise.reject(error);

        setTimeout(() => {
          const pattern = new RegExp('^Uncaught promise rejection \\(id: .*\\) ' + error.toString());
          expect(console.error).to.have.been.calledOnce;
          expect(console.error).to.have.been.calledWithMatch(pattern);
          done();
        }, 0);
      });

      it('and does not warn', function(done) {
        Promise.reject();

        setTimeout(() => {
          expect(console.warn).to.not.have.been.called;
          done();
        }, 0);
      });

      describe('when catching a rejection that has been logged as uncaught', function() {

        it('logs a warning that the previously uncaught rejection has been now caught', function(done) {
          const promise = Promise.reject();

          setTimeout(() => {
            promise.catch(e => {});
            expect(console.warn).to.have.been.calledOnce;
            expect(console.warn).to.have.been.calledWithMatch(/^Uncaught promise rejection \(id: .*\) handled/);
            done();
          }, 0);
        });

        it('error and warning are only logged once', function(done) {
          const promise = Promise.reject();

          setTimeout(() => {
            promise.catch(e => {});
            expect(console.error).to.have.been.calledOnce;
            expect(console.warn).to.have.been.calledOnce;
            done();
          }, 0);
        });

        it('logged ids are numbers', function(done) {
          const promise = Promise.reject();

          setTimeout(() => {
            promise.catch(e => {});
            const errorId = getRejectionId(console.error);
            const warningId = getRejectionId(console.warn);
            expect(errorId).to.satisfy(Number.isInteger);
            expect(warningId).to.satisfy(Number.isInteger);
            done();
          }, 0);
        });

        it('logged ids match', function(done) {
          const promise = Promise.reject();

          setTimeout(() => {
            promise.catch(e => {});
            const errorId = getRejectionId(console.error);
            const warningId = getRejectionId(console.warn);
            expect(errorId).to.equal(warningId);
            done();
          }, 0);
        });

        it('does not log for any rejections caught in between uncaught rejections', function(done) {
          const promise1 = Promise.reject();
          Promise.reject().catch(e => {});
          Promise.reject().catch(e => {});
          Promise.reject().catch(e => {});
          const promise2 = Promise.reject();

          setTimeout(() => {
            promise1.catch(e => {});
            promise2.catch(e => {});
            expect(console.error).to.have.been.calledTwice;
            expect(console.warn).to.have.been.calledTwice;
            done();
          }, 0);
        });

        it('logged ids only increment for uncaught rejections', function(done) {
          const promise1 = Promise.reject();
          Promise.reject().catch(e => {});
          Promise.reject().catch(e => {});
          Promise.reject().catch(e => {});
          const promise2 = Promise.reject();

          setTimeout(() => {
            promise1.catch(e => {});
            promise2.catch(e => {});
            const errorId1 = getRejectionId(console.error, 0);
            const errorId2 = getRejectionId(console.error, 1);
            const warnId1 = getRejectionId(console.warn, 0);
            const warnId2 = getRejectionId(console.warn, 1);
            expect(errorId1).to.equal(warnId1);
            expect(errorId2).to.equal(warnId2);
            expect(errorId2 - errorId1).to.equal(1);
            done();
          }, 0);
        });

      });

    });

  });

});

function expectFail() {
  throw new Error('expected to fail');
}

function getRejectionId(logStub, call = 0) {
  try {
    return parseInt(logStub.getCall(call).args[0].match(/\(id: (.*)\)/)[1]);
  } catch(e) {
    throw new Error('Cannot get rejection id from log: ' + e);
  }
}

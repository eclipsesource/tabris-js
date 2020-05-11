import {expect, mockTabris, restore, stub} from '../test';
import ClientMock from './ClientMock';
import {addWindowTimerMethods} from '../../src/tabris/WindowTimers';
import {create} from '../../src/tabris/App';

describe('WindowTimers', () => {

  let client;
  let target;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    target = {};
    tabris.app = create();
  });

  afterEach(restore);

  it('does not overwrite existing window methods', () => {
    const setTimeout = target.setTimeout = () => {};
    const setInterval = target.setInterval = () => {};
    const clearTimeout = target.clearTimeout = () => {};
    const clearInterval = target.clearInterval = () => {};

    addWindowTimerMethods(target);

    expect(target.setTimeout).to.equal(setTimeout);
    expect(target.setInterval).to.equal(setInterval);
    expect(target.clearTimeout).to.equal(clearTimeout);
    expect(target.clearInterval).to.equal(clearInterval);
  });

  ['setTimeout', 'setInterval'].forEach(name => describe(name, () => {

    const delay = 23;
    let timerId;
    let callback;
    let method;
    const startTimer = () => client.calls({id: tabris.app.cid, op: 'call', method: 'startTimer'})[0];
    const cancelTimer = () => client.calls({id: tabris.app.cid, op: 'call', method: 'cancelTimer'})[0];
    const isInterval = name === 'setInterval';

    beforeEach(() => {
      addWindowTimerMethods(target);
      callback = stub();
      method = target[name];
    });

    it('when called with a callback throwing an error, an error is logged', async () => {
      stub(console, 'error');
      callback.throws('error');
      method(callback);

      startTimer().parameters.callback();

      expect(console.error).to.have.been.calledWithMatch(/Uncaught error/);
    });

    describe('when called without parameters', () => {

      it('throws an error', () => {
        expect(method).to.throw('Not enough arguments to ' + name);
      });

    });

    describe('when called with illegal first parameter', () => {

      it('throws an error', () => {
        expect(() => method(23)).to.throw('Illegal argument to ' + name + ': not a function');
      });

    });

    describe('when called with delay', () => {

      beforeEach(() => {
        timerId = method(callback, delay);
      });

      it('calls app._startTimer()', () => {
        expect(startTimer().parameters).to.contain({id: 0, delay: 23, repeat: isInterval});
      });

      it('returns a number', () => {
        expect(timerId).to.be.a('number');
      });

      it('returns ascending numbers', () => {
        const nextTimerId = method(callback, 23);
        expect(nextTimerId).to.be.above(timerId);
      });

      it('returned numbers don\'t clash with other method', () => {
        const otherMethod = isInterval ? 'setTimeout' : 'setInterval';
        const timeoutTimerId = target[otherMethod](callback, delay);
        expect(timeoutTimerId).to.be.above(timerId);
      });

      ['clearTimeout', 'clearInterval'].forEach((clearMethod) => {

        describe('and ' + clearMethod + ' is called', () => {

          beforeEach(() => {
            target[clearMethod](timerId);
          });

          it('calls app._cancelTimer()', () => {
            target.clearTimeout(23);
            expect(cancelTimer().parameters).to.contain({id: 0});
          });

          it('tolerates unknown timerId', () => {
            expect(() => {
              target.clearInterval(timerId + 1);
            }).to.not.throw();
          });

        });

      });

    });

    it('passes 0 delay when argument is left out', () => {
      method(callback);

      expect(startTimer().parameters.delay).to.equal(0);
    });

    it('passes 0 delay when argument is not a number', () => {
      [1 / 0, NaN, '', {}, false].forEach((value) => {
        client.resetCalls();
        method(callback, value);

        expect(startTimer().parameters.delay).to.equal(0);
      });
    });

    it('passes 0 delay when argument is negative', () => {
      method(callback, -1);

      expect(startTimer().parameters.delay).to.equal(0);
    });

    it('passes rounded delay', () => {
      method(callback, 3.14);

      expect(startTimer().parameters.delay).to.equal(3);
    });

    it('passes zero parameters to callback', () => {
      method(callback, delay);
      startTimer().parameters.callback();

      expect(callback).to.have.been.calledWith();
    });

    it('passes one parameter to callback', () => {
      method(callback, delay, 1);
      startTimer().parameters.callback();

      expect(callback).to.have.been.calledWith(1);
    });

    it('passes four parameter to callback', () => {
      method(callback, delay, 1, 2, 3, 4);
      startTimer().parameters.callback();

      expect(callback).to.have.been.calledWith(1, 2, 3, 4);
    });

  }));

});

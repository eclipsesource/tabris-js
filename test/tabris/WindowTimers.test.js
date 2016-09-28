import ProxyStore from '../../src/tabris/ProxyStore';
import {expect, spy, restore} from '../test';
import NativeBridge from '../../src/tabris/NativeBridge';
import ClientStub from './ClientStub';
import {addWindowTimerMethods} from '../../src/tabris/WindowTimers';

describe('WindowTimers', function() {

  let client;
  let target;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      load: fn => fn.call()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    target = {};
  });

  afterEach(restore);

  it('does not overwrite existing window methods', function() {
    let setTimeout = target.setTimeout = function() {};
    let setInterval = target.setInterval = function() {};
    let clearTimeout = target.clearTimeout = function() {};
    let clearInterval = target.clearInterval = function() {};

    addWindowTimerMethods(target);

    expect(target.setTimeout).to.equal(setTimeout);
    expect(target.setInterval).to.equal(setInterval);
    expect(target.clearTimeout).to.equal(clearTimeout);
    expect(target.clearInterval).to.equal(clearInterval);
  });

  ['setTimeout', 'setInterval'].forEach(name => describe(name, function() {

    let delay = 23;
    let taskId;
    let callback;
    let method;
    let createCall = function() { return client.calls({op: 'create', type: 'tabris.Timer'})[0]; };
    let listenCall = function() { return client.calls({id: createCall().id, op: 'listen', event: 'Run'})[0]; };
    let startCall = function() { return client.calls({id: createCall().id, op: 'call', method: 'start'})[0]; };
    let isInterval = name === 'setInterval';

    beforeEach(function() {
      addWindowTimerMethods(target);
      callback = spy();
      method = target[name];
    });

    describe('when called without parameters', function() {

      it('throws an error', function() {
        expect(method).to.throw('Not enough arguments to ' + name);
      });

    });

    describe('when called with illegal first parameter', function() {

      it('throws an error', function() {
        expect(() => method(23)).to.throw('Illegal argument to ' + name + ': not a function');
      });

    });

    describe('when called with delay', function() {

      beforeEach(function() {
        taskId = method(callback, delay);
      });

      it('creates native Timer', function() {
        expect(createCall()).not.to.be.undefined;
      });

      it('passes arguments to Timer creation', function() {
        expect(createCall().properties.delay).to.equal(delay);
        expect(createCall().properties.repeat).to.equal(isInterval);
      });

      it('listens on Run event of native Timer', function() {
        expect(listenCall()).not.to.be.undefined;
      });

      it('starts the native Timer', function() {
        expect(startCall()).not.to.be.undefined;
      });

      it('create, listen, start are called in this order', function() {
        let createPosition = client.calls().indexOf(createCall());
        let listenPosition = client.calls().indexOf(listenCall());
        let startPosition = client.calls().indexOf(startCall());
        expect(listenPosition).to.be.above(createPosition);
        expect(startPosition).to.be.above(listenPosition);
      });

      it('returns a number', function() {
        expect(taskId).to.be.a('number');
      });

      it('returns ascending numbers', function() {
        let nextTaskId = method(callback, 23);
        expect(nextTaskId).to.be.above(taskId);
      });

      it("returned numbers don't clash with other method", function() {
        let otherMethod = isInterval ? 'setTimeout' : 'setInterval';
        let timeoutTaskId = target[otherMethod](callback, delay);
        expect(timeoutTaskId).to.be.above(taskId);
      });

      describe('and timer is notified, ', function() {

        beforeEach(function() {
          tabris._notify(createCall().id, 'Run', {});
        });

        it('callback is called', function() {
          expect(callback).to.have.been.called;
        });

        if (isInterval) {
          it('timer is not disposed', function() {
            let destroyCall = client.calls({id: createCall().id, op: 'destroy'})[0];
            expect(destroyCall).to.be.undefined;
          });
        } else {
          it('timer is disposed', function() {
            let destroyCall = client.calls({id: createCall().id, op: 'destroy'})[0];
            expect(destroyCall).not.to.be.undefined;
          });
        }

      });

      ['clearTimeout', 'clearInterval'].forEach((clearMethod) => {

        describe('and ' + clearMethod + ' is called', function() {

          beforeEach(function() {
            target[clearMethod](taskId);
          });

          it('calls native cancelTask', function() {
            let cancelCall = client.calls({id: createCall().id, op: 'call', method: 'cancel'})[0];
            expect(cancelCall).not.to.be.undefined;
          });

          it('destroys native timer', function() {
            let destroyCall = client.calls({id: createCall().id, op: 'destroy'})[0];
            expect(destroyCall).not.to.be.undefined;
          });

          it('tolerates unknown taskId', function() {
            expect(() => {
              target.clearInterval(taskId + 1);
            }).to.not.throw();
          });

        });

      });

    });

    it('creates native Timer on load callback', function() {
      taskId = method(callback, delay);

      expect(createCall()).not.to.be.undefined;
    });

    it('passes 0 delay when argument is left out', function() {
      method(callback);

      expect(createCall().properties.delay).to.equal(0);
    });

    it('passes 0 delay when argument is not a number', function() {
      [1 / 0, NaN, '', {}, false].forEach((value) => {
        client.resetCalls();
        method(callback, value);

        expect(createCall().properties.delay).to.equal(0);
      });
    });

    it('passes 0 delay when argument is negative', function() {
      method(callback, -1);

      expect(createCall().properties.delay).to.equal(0);
    });

    it('passes rounded delay', function() {
      method(callback, 3.14);

      expect(createCall().properties.delay).to.equal(3);
    });

    it('passes zero parameters to callback', function() {
      method(callback, delay);
      tabris._notify(createCall().id, 'Run', {});

      expect(callback).to.have.been.calledWith();
    });

    it('passes one parameter to callback', function() {
      method(callback, delay, 1);
      tabris._notify(createCall().id, 'Run', {});

      expect(callback).to.have.been.calledWith(1);
    });

    it('passes four parameter to callback', function() {
      method(callback, delay, 1, 2, 3, 4);
      tabris._notify(createCall().id, 'Run', {});

      expect(callback).to.have.been.calledWith(1, 2, 3, 4);
    });

  }));

});

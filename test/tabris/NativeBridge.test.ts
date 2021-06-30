import Events from '../../src/tabris/Events';
import {LayoutQueue} from '../../src/tabris/Layout';
import NativeBridge, {NativeClient} from '../../src/tabris/NativeBridge';
import {expect, restore, spy, stub} from '../test';

describe('NativeBridge', function() {

  let native: NativeClient;
  let bridge: NativeBridge;
  let log: string[];

  beforeEach(function() {
    delete (LayoutQueue as any)._instance;
    (global as any).tabris = Object.assign({
      flush() {
        this.trigger('flush');
        this._nativeBridge.clearCache();
        this._nativeBridge.flush();
      }
    }, Events);
    log = [];
    native = {} as NativeClient;
    ['create', 'destroy', 'listen', 'set', 'get', 'call'].forEach(method => {
      native[method] = spy(() => {
        log.push(method);
        return 23;
      });
    });
    bridge = global.tabris._nativeBridge = new NativeBridge(native);
  });

  afterEach(restore);

  describe('without native flush support', function() {

    describe('create', function() {

      beforeEach(function() {
        bridge.create('id', 'type');
      });

      it('is not transferred immediately', function() {
        expect(native.create).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.create).to.have.been.calledWith('id', 'type', {});
      });

    });

    describe('set', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
      });

      it('is not transferred immediately', function() {
        expect(native.set).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.set).to.have.been.calledWith('id', {foo: 23});
      });

    });

    describe('subsequent create and set properties', function() {

      beforeEach(function() {
        bridge.create('id', 'type');
        bridge.set('id', 'foo', 23);
        bridge.set('id', 'bar', 42);
      });

      it('is not transferred immediately', function() {
        expect(native.create).to.have.not.been.called;
        expect(native.set).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.create).to.have.been.calledWith('id', 'type', {foo: 23, bar: 42});
        expect(native.set).to.have.not.been.called;
      });

    });

    describe('listen', function() {

      beforeEach(function() {
        bridge.listen('id', 'event', false);
      });

      it('is not transferred immediately', function() {
        expect(native.listen).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.listen).to.have.been.calledWith('id', 'event', false);
      });

    });

    describe('destroy', function() {

      beforeEach(function() {
        bridge.destroy('id');
      });

      it('is not transferred immediately', function() {
        expect(native.destroy).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.destroy).to.have.been.calledWith('id');
      });

    });

    describe('get', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
        tabris.flush();
      });

      it('is transferred immediately', function() {
        bridge.get('id', 'foo');
        expect(native.get).to.have.been.calledWith('id', 'foo');
      });

      it('returns a value', function() {
        const result = bridge.get('id', 'foo');
        expect(result).to.equal(23);
      });

      it('returns value cached from set', function() {
        bridge.set('id', 'foo', 24);
        const result = bridge.get('id', 'foo');
        expect(result).to.equal(24);
      });

      it('returns value cached from get', function() {
        const result1 = bridge.get('id', 'foo');
        const result2 = bridge.get('id', 'foo');

        expect(result1).to.equal(23);
        expect(result2).to.equal(23);
        expect(native.get).to.have.been.calledOnce;
      });

      it('returns value explicitly cached by cacheValue', function() {
        bridge.cacheValue('id', 'foo', 'bar');

        expect(bridge.get('id', 'foo')).to.equal('bar');
      });

      it('returns native value after flush clears cache', function() {
        bridge.set('id', 'foo', 24);

        const result1 = bridge.get('id', 'foo');
        tabris.flush();
        const result2 = bridge.get('id', 'foo');

        expect(result1).to.equal(24);
        expect(result2).to.equal(23);
      });

      it('flushes buffered operations first', function() {
        bridge.get('id', 'foo');
        expect(log).to.eql(['set', 'get']);
      });

      it('flushes layout queue first', function() {
        stub(LayoutQueue.instance, 'flush').callsFake(() => bridge.set('id2', 'bar', 23));

        bridge.get('id', 'foo');

        expect(log).to.eql(['set', 'set', 'get']);
      });

    });

    describe('call', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
      });

      it('is transferred immediately', function() {
        bridge.call('id', 'foo', {foo: 23});
        expect(native.call).to.have.been.calledWith('id', 'foo', {foo: 23});
      });

      it('returns a value', function() {
        const result = bridge.call('id', 'foo', {foo: 23});
        expect(result).to.equal(23);
      });

      it('flushes buffered operations first', function() {
        bridge.call('id', 'foo', {foo: 23});
        expect(log).to.eql(['set', 'call']);
      });

      it('allows operation to be added in beforeFlush event', function() {
        stub(LayoutQueue.instance, 'flush').callsFake(() => bridge.set('id2', {bar: 23}));

        bridge.call('id', 'foo', {foo: 23});

        expect(log).to.eql(['set', 'set', 'call']);
      });

    });

  });

  describe('with native flush support', function() {

    beforeEach(function() {
      native.flush = spy(() => log.push('flush'));
    });

    describe('create', function() {

      beforeEach(function() {
        bridge.create('id', 'type');
      });

      it('is not transferred immediately', function() {
        expect(native.flush).to.have.not.been.called;
        expect(native.create).to.have.not.been.called;
      });

      it('is transferred in flush', function() {
        bridge.flush();
        expect(native.create).to.have.not.been.called;
        expect(native.flush).to.have.been.calledWith([['create', 'id', 'type', {}]]);
      });

    });

    describe('set', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
      });

      it('is not transferred immediately', function() {
        expect(native.set).to.have.not.been.called;
        expect(native.flush).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.set).to.have.not.been.called;
        expect(native.flush).to.have.been.calledWith([['set', 'id', {foo: 23}]]);
      });

    });

    describe('subsequent create and set properties', function() {

      beforeEach(function() {
        bridge.create('id', 'type');
        bridge.set('id', 'foo', 23);
        bridge.set('id', 'bar', 42);
      });

      it('is not transferred immediately', function() {
        expect(native.create).to.have.not.been.called;
        expect(native.set).to.have.not.been.called;
        expect(native.flush).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.create).to.have.not.been.called;
        expect(native.set).to.have.not.been.called;
        expect(native.flush).to.have.been.calledWith([['create', 'id', 'type', {foo: 23, bar: 42}]]);
      });

    });

    describe('listen', function() {

      beforeEach(function() {
        bridge.listen('id', 'event', false);
      });

      it('is not transferred immediately', function() {
        expect(native.listen).to.have.not.been.called;
        expect(native.flush).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.listen).to.have.not.been.called;
        expect(native.flush).to.have.been.calledWith([['listen', 'id', 'event', false]]);
      });

    });

    describe('destroy', function() {

      beforeEach(function() {
        bridge.destroy('id');
      });

      it('is not transferred immediately', function() {
        expect(native.destroy).to.have.not.been.called;
        expect(native.flush).to.have.not.been.called;
      });

      it('is transferred on flush', function() {
        bridge.flush();
        expect(native.destroy).to.have.not.been.called;
        expect(native.flush).to.have.been.calledWith([['destroy', 'id']]);
      });

    });

    describe('get', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
        tabris.flush();
      });

      it('is transferred immediately', function() {
        bridge.get('id', 'foo');
        expect(native.get).to.have.been.calledWith('id', 'foo');
      });

      it('returns a value', function() {
        const result = bridge.get('id', 'foo');
        expect(result).to.equal(23);
      });

      it('returns value cached from set', function() {
        bridge.set('id', 'foo', 24);
        const result = bridge.get('id', 'foo');
        expect(result).to.equal(24);
      });

      it('returns value cached from get', function() {
        const result1 = bridge.get('id', 'foo');
        const result2 = bridge.get('id', 'foo');

        expect(result1).to.equal(23);
        expect(result2).to.equal(23);
        expect(native.get).to.have.been.calledOnce;
      });

      it('returns value explicitly cached by cacheValue', function() {
        bridge.cacheValue('id', 'foo', 'bar');

        expect(bridge.get('id', 'foo')).to.equal('bar');
      });

      it('returns native value after flush clears cache', function() {
        bridge.set('id', 'foo', 24);

        const result1 = bridge.get('id', 'foo');
        tabris.flush();
        const result2 = bridge.get('id', 'foo');

        expect(result1).to.equal(24);
        expect(result2).to.equal(23);
      });

      it('flushes buffered operations first', function() {
        bridge.get('id', 'foo');
        expect(log).to.eql(['flush', 'get']);
      });

      it('flushes layout queue first', function() {
        stub(LayoutQueue.instance, 'flush').callsFake(() => bridge.set('id2', 'bar', 23));

        bridge.get('id', 'foo');

        expect(log).to.eql(['flush', 'flush', 'get']);
      });

    });

    describe('call', function() {

      beforeEach(function() {
        bridge.set('id', 'foo', 23);
      });

      it('is transferred immediately', function() {
        bridge.call('id', 'foo', {foo: 23});
        expect(native.call).to.have.been.calledWith('id', 'foo', {foo: 23});
      });

      it('returns a value', function() {
        const result = bridge.call('id', 'foo', {foo: 23});
        expect(result).to.equal(23);
      });

      it('flushes buffered operations first', function() {
        bridge.call('id', 'foo', {foo: 23});
        expect(log).to.eql(['flush', 'call']);
      });

      it('allows operation to be added in beforeFlush event', function() {
        stub(LayoutQueue.instance, 'flush').callsFake(() => bridge.set('id2', 'bar', 23));

        bridge.call('id', 'foo', {foo: 23});

        expect(log).to.eql(['flush', 'call']);
      });

    });

    it('sends operations grouped in flush call', function() {
      bridge.create('id', 'tabris.Foo');
      bridge.set('id', 'bar', 'baz');
      bridge.listen('id', 'myEvent', true);
      bridge.set('id', 'bar', 'baz2');
      bridge.destroy('id');

      bridge.flush();

      expect(log).to.deep.equal(['flush']);
      expect(native.flush).to.have.been.calledWith([
        ['create', 'id', 'tabris.Foo', {bar: 'baz'}],
        ['listen', 'id', 'myEvent', true],
        ['set', 'id', {bar: 'baz2'}],
        ['destroy', 'id']
      ]);
    });

  });

});

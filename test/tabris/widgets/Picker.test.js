import {expect, stub, spy, restore} from '../../test';
import ProxyStore from '../../../src/tabris/ProxyStore';
import NativeBridge from '../../../src/tabris/NativeBridge';
import ClientStub from '../ClientStub';
import Picker from '../../../src/tabris/widgets/Picker';

describe('Picker', function() {

  let client, picker;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    picker = new Picker();
  });

  afterEach(restore);

  describe('creation', function() {

    it('creates picker', function() {
      expect(client.calls({op: 'create'})[0].type).to.eql('tabris.Picker');
    });

    it('initializes selectionIndex', function() {
      expect(client.calls({op: 'create'})[0].properties).to.eql({selectionIndex: 0});
    });

  });

  describe('events:', function() {

    let listener;
    let checkEvent = function(value) {
      expect(listener).to.have.been.calledOnce;
      if (arguments.length > 0) {
        expect(listener).to.have.been.calledWith(picker, value);
      } else {
        expect(listener).to.have.been.calledWith(picker);
      }
    };
    let checkListen = function(event) {
      let listen = client.calls({op: 'listen', id: picker.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    };

    beforeEach(function() {
      listener = spy();
    });

    it('select', function() {
      picker.on('select', listener);
      picker.set('items', ['foo', 'bar']);

      tabris._notify(picker.cid, 'select', {selectionIndex: 1});

      checkEvent('bar', {index: 1});
      checkListen('select');
    });

    it('change:selection on interactive change', function() {
      picker.on('change:selection', listener);
      picker.set('items', ['foo', 'bar']);

      tabris._notify(picker.cid, 'select', {selectionIndex: 1});

      checkEvent('bar', {index: 1});
      checkListen('select');
    });

    it('change:selection on programmatic change', function() {
      picker.on('change:selection', listener);
      picker.set('items', ['foo', 'bar']);

      picker.set('selection', 'foo');

      expect(listener).to.have.been.calledWith(picker, 'foo');
      expect(listener).to.have.been.calledOnce;
    });

    it('change:selectionIndex', function() {
      picker.on('change:selectionIndex', listener);

      tabris._notify(picker.cid, 'select', {selectionIndex: 23});

      checkEvent(23);
      checkListen('select');
    });

  });

  describe('properties:', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    describe('items', function() {

      it('initial value is empty array', function() {
        expect(picker.get('items')).to.eql([]);
      });

      it('initial value is a safe copy', function() {
        picker.get('items').push(23);

        expect(picker.get('items')).to.eql([]);
      });

      it('converts null to empty array', function() {
        expect(picker.set('items', null).get('items')).to.eql([]);
      });

      it('set SETs items property', function() {
        picker.set('items', ['a', 'b', 'c']);

        let call = client.calls({op: 'set', id: picker.cid})[0];
        expect(call.properties).to.eql({items: ['a', 'b', 'c']});
      });

      it('get does not GET from client', function() {
        picker.get('items');

        expect(client.calls({op: 'get', id: picker.cid}).length).to.equal(0);
      });

    });

    describe('itemText', function() {

      it('initial value is function', function() {
        expect(picker.get('itemText')).to.be.a('function');
      });

      it('initial function translates to string', function() {
        let fn = picker.get('itemText');

        expect(fn('foo')).to.equal('foo');
        expect(fn(23)).to.equal('23');
        expect(fn(null)).to.equal('');
        expect(fn()).to.equal('');
      });

      it('does not SET property on client', function() {
        picker.set('itemText', function(item) { return item.name; });

        expect(client.calls({op: 'set', id: picker.cid}).length).to.equal(0);
      });

    });

    describe('selectionIndex', function() {

      it('set SETs selectionIndex', function() {
        picker.set('selectionIndex', 23);

        expect(client.calls({op: 'set', id: picker.cid})[0].properties).to.eql({selectionIndex: 23});
      });

    });

    it('get GETs selectionIndex', function() {
      stub(client, 'get').returns(23);

      expect(picker.get('selectionIndex')).to.equal(23);
      expect(client.get).to.have.been.calledWith(picker.cid, 'selectionIndex');
    });

    describe('selection', function() {

      it('get returns items entry', function() {
        picker.set('items', ['foo', 'bar']);
        stub(client, 'get').returns(1);

        expect(picker.get('selection')).to.equal('bar');
      });

      it('set SETs selectionIndex', function() {
        picker.set('items', ['foo', 'bar']);

        picker.set('selection', 'bar');

        expect(client.calls({op: 'set', id: picker.cid})[0].properties.selectionIndex).to.equal(1);
      });

    });

    it('set together with items SETs selectionIndex', function() {
      picker.set({selection: 'bar', items: ['foo', 'bar']});
      expect(client.calls({op: 'set', id: picker.cid})[0].properties).to.eql({
        selectionIndex: 1,
        items: ['foo', 'bar']
      });
    });

    it('set with unknown value prints warning', function() {
      spy(console, 'warn');
      picker.set({selection: 'bar2'});

      expect(client.calls({op: 'set', id: picker.cid}).length).to.equal(0);
      expect(console.warn).to.have.been.calledWith('Could not set picker selection bar2: item not found');
    });

  });

  it('reorders properties', function() {
    let result = picker._reorderProperties(['foo', 'selection', 'items', 'bar']);
    expect(result).to.eql(['foo', 'bar', 'items', 'selection']);
  });

});

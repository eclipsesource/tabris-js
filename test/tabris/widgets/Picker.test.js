import {expect, stub, spy, restore, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import Picker from '../../../src/tabris/widgets/Picker';

describe('Picker', function() {

  let client, picker;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
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
    function checkListen(event) {
      let listen = client.calls({op: 'listen', id: picker.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    }

    beforeEach(function() {
      listener = spy();
    });

    it('select', function() {
      picker.on('select', listener);
      picker.items = ['foo', 'bar'];

      tabris._notify(picker.cid, 'select', {selectionIndex: 1});

      checkListen('select');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, item: 'bar', index: 1});
    });

    it('selectionChanged on interactive change', function() {
      picker.on('selectionChanged', listener);
      picker.items = ['foo', 'bar'];

      tabris._notify(picker.cid, 'select', {selectionIndex: 1});

      checkListen('select');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, value: 'bar'});
    });

    it('selectionChanged on programmatic change', function() {
      picker.on('selectionChanged', listener);
      picker.items = ['foo', 'bar'];

      picker.selection = 'foo';

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, value: 'foo'});
    });

    it('selectionIndexChanged', function() {
      picker.on('selectionIndexChanged', listener);

      tabris._notify(picker.cid, 'select', {selectionIndex: 23});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, value: 23});
      checkListen('select');
    });

  });

  describe('properties:', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    describe('items', function() {

      it('initial value is empty array', function() {
        expect(picker.items).to.eql([]);
      });

      it('initial value is a safe copy', function() {
        picker.items.push(23);

        expect(picker.items).to.eql([]);
      });

      it('converts null to empty array', function() {
        picker.items = null;

        expect(picker.items).to.eql([]);
      });

      it('set SETs items property', function() {
        picker.items = ['a', 'b', 'c'];

        let call = client.calls({op: 'set', id: picker.cid})[0];
        expect(call.properties).to.eql({items: ['a', 'b', 'c']});
      });

      it('get does not GET from client', function() {
        picker.items;

        expect(client.calls({op: 'get', id: picker.cid}).length).to.equal(0);
      });

    });

    describe('itemText', function() {

      it('initial value is function', function() {
        expect(picker.itemText).to.be.a('function');
      });

      it('initial function translates to string', function() {
        let fn = picker.itemText;

        expect(fn('foo')).to.equal('foo');
        expect(fn(23)).to.equal('23');
        expect(fn(null)).to.equal('');
        expect(fn()).to.equal('');
      });

      it('does not SET property on client', function() {
        picker.itemText = function(item) { return item.name; };

        expect(client.calls({op: 'set', id: picker.cid}).length).to.equal(0);
      });

    });

    describe('selectionIndex', function() {

      it('set SETs selectionIndex', function() {
        picker.selectionIndex = 23;

        expect(client.calls({op: 'set', id: picker.cid})[0].properties).to.eql({selectionIndex: 23});
      });

    });

    it('get GETs selectionIndex', function() {
      stub(client, 'get').returns(23);

      expect(picker.selectionIndex).to.equal(23);
      expect(client.get).to.have.been.calledWith(picker.cid, 'selectionIndex');
    });

    describe('selection', function() {

      it('get returns items entry', function() {
        picker.items = ['foo', 'bar'];
        stub(client, 'get').returns(1);

        expect(picker.selection).to.equal('bar');
      });

      it('set SETs selectionIndex', function() {
        picker.items = ['foo', 'bar'];

        picker.selection = 'bar';

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
      stub(console, 'warn');

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

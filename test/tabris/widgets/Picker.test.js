import {expect, stub, spy, restore, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import Picker from '../../../src/tabris/widgets/Picker';

describe('Picker', function() {

  let client, picker;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    picker = new Picker();
    tabris.trigger('flush');
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates picker', function() {
      expect(client.calls({op: 'create'})[0].type).to.deep.equal('tabris.Picker');
    });

    it('initializes selectionIndex', function() {
      expect(client.calls({op: 'create'})[0].properties).to.deep.equal({selectionIndex: 0});
    });

  });

  describe('events', function() {

    let listener;
    function checkListen(event) {
      const listen = client.calls({op: 'listen', id: picker.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    }

    beforeEach(function() {
      listener = spy();
    });

    it('select', function() {
      picker.onSelect(listener);
      picker.itemCount = 2;

      tabris._notify(picker.cid, 'select', {selectionIndex: 1});

      checkListen('select');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, index: 1});
    });

    it('selectionIndexChanged', function() {
      picker.onSelectionIndexChanged(listener);

      tabris._notify(picker.cid, 'select', {selectionIndex: 23});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: picker, value: 23});
      checkListen('select');
    });

  });

  describe('properties', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    describe('itemCount', function() {

      it('defaults to 0', function() {
        expect(picker.itemCount).to.equal(0);
      });

      it('does not set a native property', function() {
        picker.itemCount = 3;

        expect(client.calls({op: 'set', id: picker.cid}).length).to.equal(0);
      });

      it('does not get native property', function() {
        picker.itemCount;

        expect(client.calls({op: 'get', id: picker.cid}).length).to.equal(0);
      });

      it('sets native property `items` on flush', function() {
        picker.itemCount = 3;

        tabris.trigger('flush');

        const call = client.calls({op: 'set', id: picker.cid})[0];
        expect(call.properties).to.deep.equal({items: ['', '', '']});
      });

    });

    describe('itemText', function() {

      beforeEach(function() {
        picker.itemCount = 3;
        tabris.trigger('flush');
        client.resetCalls();
      });

      it('initial value is function', function() {
        expect(picker.itemText).to.be.a('function');
      });

      it('initial function translates to empty string', function() {
        const fn = picker.itemText;

        expect(fn(0)).to.equal('');
      });

      it('does not set a native property', function() {
        picker.itemText = () => 'foo';

        expect(client.calls({op: 'set', id: picker.cid}).length).to.equal(0);
      });

      it('does not get a native property', function() {
        picker.itemText;

        expect(client.calls({op: 'get', id: picker.cid}).length).to.equal(0);
      });

      it('updates native property `items` on flush', function() {
        picker.itemText = () => 'foo';

        tabris.trigger('flush');

        expect(client.calls({op: 'set', id: picker.cid})[0].properties).to.deep.equal({items: ['foo', 'foo', 'foo']});
      });

    });

    describe('selectionIndex', function() {

      it('set native property `selectionIndex` on flush', function() {
        picker.selectionIndex = 23;

        tabris.trigger('flush');

        expect(client.calls({op: 'set', id: picker.cid})[0].properties).to.deep.equal({selectionIndex: 23});
      });

      it('gets native property `selectionIndex`', function() {
        stub(client, 'get').returns(23);

        expect(picker.selectionIndex).to.equal(23);
        expect(client.get).to.have.been.calledWith(picker.cid, 'selectionIndex');
      });

      it('gets cached value before flush', function() {
        spy(client, 'get');

        picker.selectionIndex = 23;

        expect(picker.selectionIndex).to.equal(23);
        expect(client.get).not.to.have.been.called;
      });

    });

    describe('toXML', function() {

      it('prints xml element with itemCount and selectionIndex', function() {
        stub(client, 'get').returns({});

        picker.itemCount = 23;
        picker.selectionIndex = 2;

        expect(picker.toXML()).to.match(/<Picker .* itemCount='23' selectionIndex='2'\/>/);
      });

    });

  });

});

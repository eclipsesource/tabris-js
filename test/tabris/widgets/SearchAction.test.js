import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import SearchAction from '../../../src/tabris/widgets/SearchAction';
import {toXML} from '../../../src/tabris/Console';

describe('SearchAction', function() {

  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('create', function() {

    let actionCreateCalls;

    beforeEach(function() {
      new SearchAction({title: 'Foo', enabled: true});
      actionCreateCalls = client.calls({op: 'create', type: 'tabris.SearchAction'});
    });

    it('creates an action', function() {
      expect(actionCreateCalls.length).to.equal(1);
    });

    it('properties are passed to created action', function() {
      expect(actionCreateCalls[0].properties.title).to.eql('Foo');
      expect(actionCreateCalls[0].properties.enabled).to.equal(true);
    });

  });

  describe('set', function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
      client.resetCalls();
    });

    it('translates placement priority to uppercase', function() {
      action.placementPriority = 'low';

      const call = client.calls({op: 'set'})[0];
      expect(call.properties.placementPriority).to.equal('low');
    });

  });

  describe('get', function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
      client.resetCalls();
    });

    it('returns cached placementPriority', function() {
      action.placementPriority = 'low';

      const result = action.placementPriority;

      expect(result).to.equal('low');
    });

    it('returns initial values', function() {
      expect(action.enabled).to.equal(true);
      expect(action.image).to.equal(null);
      expect(action.title).to.equal('');
      expect(action.visible).to.equal(true);
      expect(action.proposals).to.eql([]);
      expect(action.placementPriority).to.equal('normal');
    });

  });

  describe('native events', function() {

    let action, listener;

    beforeEach(function() {
      action = new SearchAction();
      listener = spy();
    });

    function checkListen(event) {
      const listen = client.calls({op: 'listen', id: action.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    }

    it('select', function() {
      action.onSelect(listener);
      tabris._notify(action.cid, 'select', {});

      checkListen('select');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: action});
    });

    it('accept', function() {
      action.onAccept(listener);
      tabris._notify(action.cid, 'accept', {text: 'foo'});

      checkListen('accept');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: action, text: 'foo'});
    });

  });

  describe('open', function() {

    let action;

    beforeEach(function() {
      action = new SearchAction();
    });

    it("invokes 'open' call operation on native bridge", function() {
      spy(client, 'call');

      action.open();

      expect(client.call).to.have.been.calledWith(action.cid, 'open', {});
    });

    it('returns self to allow chaining', function() {
      const result = action.open();

      expect(result).to.equal(action);
    });

  });

  describe('toXML', function() {

    it('prints xml element with text', function() {
      const action = new SearchAction({title: 'Foo'});
      stub(client, 'get')
        .withArgs(action.cid, 'bounds').returns({})
        .withArgs(action.cid, 'text').returns('');
      expect(action[toXML]()).to.match(/<SearchAction .* title='Foo'\/>/);
    });

    it('prints xml element with title, text and message', function() {
      const action = new SearchAction({title: 'Foo', message: 'baz'});
      stub(client, 'get')
        .withArgs(action.cid, 'bounds').returns({})
        .withArgs(action.cid, 'text').returns('bar');
      expect(action[toXML]()).to.match(/<SearchAction .* title='Foo' text='bar' message='baz'\/>/);
    });

  });

});

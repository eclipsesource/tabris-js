import {expect, spy, restore, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import Action from '../../../src/tabris/widgets/Action';

describe('Action', function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  afterEach(restore);

  describe('create', function() {

    let actionCreateCalls;

    beforeEach(function() {
      new Action({title: 'Foo', enabled: true});
      actionCreateCalls = client.calls({op: 'create', type: 'tabris.Action'});
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
      action = new Action();
      client.resetCalls();
    });

    it('translates placement priority to uppercase', function() {
      action.set('placementPriority', 'low');

      let call = client.calls({op: 'set'})[0];
      expect(call.properties.placementPriority).to.equal('LOW');
    });

  });

  describe('get', function() {

    let action;

    beforeEach(function() {
      action = new Action();
      client.resetCalls();
    });

    it('returns initial default property values', function() {
      expect(action.get('image')).to.equal(null);
      expect(action.get('visible')).to.equal(true);
      expect(action.get('placementPriority')).to.equal('normal');
    });

    it('returns cached placementPriority', function() {
      action.set('placementPriority', 'low');

      let result = action.get('placementPriority');

      expect(result).to.equal('low');
    });

  });

  describe('select event', function() {

    let action, listener;

    beforeEach(function() {
      action = new Action();
      listener = spy();
    });

    it('sends listen for select', function() {
      action.on('select', listener);

      let listen = client.calls({op: 'listen', id: action.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal('select');
      expect(listen[0].listen).to.equal(true);
    });

    it('is fired with parameters', function() {
      action.on('select', listener);

      tabris._notify(action.cid, 'select', {});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: action});
    });

  });

});

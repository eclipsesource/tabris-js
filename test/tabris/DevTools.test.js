import {expect, mockTabris, stub, restore} from '../test';
import ClientMock from './ClientMock';
import DevTools, {create as createDevTools} from '../../src/tabris/DevTools';

describe('DevTools', function() {

  /** @type {DevTools} */
  let devTools;

  /** @type {ClientMock & {call: () => any}} */
  let client;

  beforeEach(function() {
    // @ts-ignore
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  it('cannot be instantiated', function() {
    expect(() => new DevTools()).to.throw(Error, 'DevTools can not be created');
  });

  describe('create', function() {

    it('creates a native object', function() {
      createDevTools();
      expect(client.calls({op: 'create', type: 'tabris.DevTools'})).to.not.be.empty;
    });

    it('creates an instance', function() {
      expect(createDevTools()).to.be.instanceOf(DevTools);
    });

  });

  describe('instance', function() {

    beforeEach(function() {
      devTools = createDevTools();
    });

    it('can not be disposed', function() {
      expect(() => {
        devTools.dispose();
      }).to.throw(Error, 'Cannot dispose devTools object');
    });

    describe('showUi', function() {

      it('CALLs showUi', function() {
        devTools.showUi();

        const calls = client.calls({id: devTools.cid, op: 'call', method: 'showUi'});
        expect(calls.length).to.equal(1);
      });

      it('returns true', function() {
        stub(client, 'call').returns(true);
        expect(devTools.showUi()).to.be.true;
      });

      it('returns false', function() {
        stub(client, 'call').returns(false);
        expect(devTools.showUi()).to.be.false;
      });

    });

    describe('hideUi', function() {

      it('CALLs hideUi', function() {
        devTools.hideUi();

        const calls = client.calls({id: devTools.cid, op: 'call', method: 'hideUi'});
        expect(calls.length).to.equal(1);
      });

    });

    describe('isUiVisible', function() {

      it('CALLs isUiVisible', function() {
        devTools.isUiVisible();

        const calls = client.calls({id: devTools.cid, op: 'call', method: 'isUiVisible'});
        expect(calls.length).to.equal(1);
      });

      it('returns true', function() {
        stub(client, 'call').returns(true);
        expect(devTools.isUiVisible()).to.be.true;
      });

      it('returns false', function() {
        stub(client, 'call').returns(false);
        expect(devTools.isUiVisible()).to.be.false;
      });

    });

  });

});

import {expect, restore, mockTabris} from '../../test';
import ClientMock from '../ClientMock';
import Drawer, {create} from '../../../src/tabris/widgets/Drawer';
import Composite from '../../../src/tabris/widgets/Composite';
import ContentView from '../../../src/tabris/widgets/ContentView';

describe('Drawer', function() {

  /** @type {Drawer} */
  let drawer;

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    drawer = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new Drawer({});
    }).to.throw(Error);
  });

  it('is a Drawer', function() {
    expect(drawer).to.be.an.instanceOf(Drawer);
  });

  it('is a ContentView', function() {
    expect(drawer).to.be.an.instanceOf(ContentView);
  });

  it('can not be disposed', function() {
    expect(() => {
      drawer.dispose();
    }).to.throw(Error);
  });

  it('can not be reparented', function() {
    expect(() => {
      new Composite().append(drawer);
    }).to.throw(Error);
  });

  describe('instance: ', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    it('has "enabled" set to "false" by default', function() {
      expect(drawer.enabled).to.be.false;
    });

    describe('open()', function() {

      it('CALLs open', function() {
        drawer.open();
        expect(client.calls({op: 'call', id: drawer.cid})[0].method).to.equal('open');
      });

    });

    describe('open', function() {

      it('LISTENs to open event', function() {
        drawer.onOpen(() => {});

        expect(client.calls({id: drawer.cid, op: 'listen', listen: true, event: 'open'}).length).to.equal(1);
      });

    });

    describe('close()', function() {

      it('CALLs close', function() {
        drawer.close();
        expect(client.calls({op: 'call', id: drawer.cid})[0].method).to.equal('close');
      });

    });

    describe('close', function() {

      it('LISTENs to close event', function() {
        drawer.onClose(() => {});

        expect(client.calls({id: drawer.cid, op: 'listen', listen: true, event: 'close'}).length).to.equal(1);
      });

    });

  });

});

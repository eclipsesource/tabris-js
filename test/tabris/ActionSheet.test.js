import {expect, mockTabris, restore, spy} from '../test';
import ClientStub from './ClientStub';
import ActionSheet from '../../src/tabris/ActionSheet';

describe('ActionSheet', () => {

  let client, actionSheet;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    actionSheet = new ActionSheet();
  });

  afterEach(restore);

  describe('open', () => {

    it('returns this', () => {
      expect(actionSheet.open()).to.equal(actionSheet);
    });

    it('calls open', () => {
      actionSheet.open();
      expect(client.calls({op: 'call'})[0].method).to.equal('open');
    });

    it('throws if actionSheet was closed', () => {
      actionSheet.open();
      actionSheet.close();
      expect(() => actionSheet.open()).to.throw('Can not open a popup that was disposed');
    });

  });

  describe('actions', () => {

    it('defaults to empty array', () => {
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('warns for invalid style', () => {
      spy(console, 'warn');

      actionSheet.actions = [{style: 'foo'}];

      expect(console.warn).to.have.been.calledWithMatch(/Invalid action style/);
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('throws for invalid image', () => {
      spy(console, 'warn');

      actionSheet.actions = [{image: 23}];

      expect(console.warn).to.have.been.calledWithMatch(/Not an image/);
      expect(actionSheet.actions).to.deep.equal([]);
    });

    it('stringifies title', () => {
      client.resetCalls();

      actionSheet.actions = [{title: {toString: () => 'foo'}}];

      expect(client.calls({op: 'set'})[0]).to.deep.equal({
        op: 'set',
        id: actionSheet.cid,
        properties: {actions: [{title: 'foo'}]}
      });
    });
  });

  describe('close', () => {

    it('returns this', () => {
      expect(actionSheet.close()).to.equal(actionSheet);
    });

    it('disposes the actionSheet', () => {
      actionSheet.close();
      expect(actionSheet.isDisposed()).to.equal(true);
    });

  });

  describe('close event', () => {

    it('actionSheet LISTENs to close', () => {
      actionSheet.onClose(spy());

      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: actionSheet.cid,
        event: 'close',
        listen: true
      });
    });

    it('fires close event', () => {
      let closeOk = spy();
      let close = spy();
      actionSheet.on('closeOk', closeOk);
      actionSheet.onClose(close);

      tabris._notify(actionSheet.cid, 'close', {});

      expect(closeOk).not.to.have.been.called;
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: actionSheet});
    });

  });

  describe('select event', () => {

    it('actionSheet LISTENs to select', () => {
      actionSheet.onSelect(spy());

      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: actionSheet.cid,
        event: 'select',
        listen: true
      });
    });

    it('fires select event', () => {
      let select = spy();
      actionSheet.onSelect(select);

      tabris._notify(actionSheet.cid, 'select', {});

      expect(select).to.have.been.calledOnce;
      expect(select).to.have.been.calledWithMatch({target: actionSheet});
    });

  });

});

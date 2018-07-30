import {expect, mockTabris, restore, spy} from '../../test';
import ClientStub from '../ClientStub';
import Popover from '../../../src/tabris/Popover';
import ContentView from '../../../src/tabris/widgets/ContentView';

describe('Popover', () => {

  let client, popover;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    popover = new Popover();
  });

  afterEach(restore);

  describe('open', () => {

    it('returns this', () => {
      expect(popover.open()).to.equal(popover);
    });

    it('calls open', () => {
      popover.open();
      expect(client.calls({op: 'call'})[0].method).to.equal('open');
    });

    it('throws if popover was closed', () => {
      popover.open();
      popover.close();
      expect(() => popover.open()).to.throw('Can not open a popup that was disposed');
    });

  });

  describe('contentView', () => {

    it('is instance of ContentView', () => {
      expect(popover.contentView).to.be.an.instanceOf(ContentView);
    });

    it('is read-only', () => {
      let contentView = popover.contentView;

      delete popover.contentView;
      popover.contentView = undefined;

      expect(popover.contentView).to.equal(contentView);
    });

    it('is set on native side on popover creation', () => {
      expect(client.calls({op: 'set'})[0]).to.deep.equal({
        op: 'set',
        id: popover.cid,
        properties: {contentView: popover.contentView.cid}
      });
    });
  });

  describe('close', () => {

    it('returns this', () => {
      expect(popover.close()).to.equal(popover);
    });

    it('disposes the popover', () => {
      popover.close();
      expect(popover.isDisposed()).to.equal(true);
    });

  });

  describe('close event', () => {

    it('popover always LISTENs to close', () => {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: popover.cid,
        event: 'close',
        listen: true
      });
    });

    it('fires close event', () => {
      let closeOk = spy();
      let close = spy();
      popover.on('closeOk', closeOk);
      popover.onClose(close);

      tabris._notify(popover.cid, 'close', {});

      expect(closeOk).not.to.have.been.called;
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: popover});
    });

  });

});

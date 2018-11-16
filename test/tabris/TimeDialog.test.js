import {expect, mockTabris, restore, spy} from '../test';
import ClientStub from './ClientStub';
import TimeDialog from '../../src/tabris/TimeDialog';

describe('TimeDialog', function() {

  let client, dialog;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    dialog = new TimeDialog();
  });

  afterEach(restore);

  describe('date', function() {

    it('initial value is null', function() {
      expect(dialog.date).to.equal(null);
    });

    it('can be set to Date', function() {
      const date = new Date();

      dialog.date = date;

      expect(client.calls({op: 'set'})[0].properties.date).to.equal(date.getTime());
    });

    it('can only be set to Date', function() {
      expect(() => dialog.date = 'foo').to.throw();
    });

  });

  describe('open', function() {

    it('returns this', function() {
      expect(dialog.open()).to.equal(dialog);
    });

    it('CALLs open', function() {
      dialog.open();
      expect(client.calls({op: 'call'})[0].method).to.equal('open');
    });

    it('throws if dialog was closed', function() {
      dialog.open();
      dialog.close();
      expect(() => dialog.open()).to.throw('Can not open a popup that was disposed');
    });

  });

  describe('close', function() {

    it('returns this', function() {
      expect(dialog.close()).to.equal(dialog);
    });

    it('disposes the dialog', function() {
      dialog.close();
      expect(dialog.isDisposed()).to.equal(true);
    });

  });

  describe('close event', function() {

    it('dialog always listens to close', function() {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: dialog.cid,
        event: 'close',
        listen: true
      });
    });

    it('fires close event', function() {
      const close = spy();
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close');

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog});
    });

  });

  describe('select event', function() {

    it('fires select and close', function() {
      const date = new Date();
      const select = spy();
      const close = spy();
      dialog.onSelect(select);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'select', {date: date.getTime()});

      expect(select).to.have.been.calledOnce;
      expect(select).to.have.been.calledWithMatch({target: dialog, date});
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog});
    });

  });

});

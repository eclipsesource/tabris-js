import {expect, mockTabris, restore, spy} from '../test';
import ClientStub from './ClientStub';
import DateDialog from '../../src/tabris/DateDialog';

describe('DateDialog', function() {

  let client, dialog;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    dialog = new DateDialog();
  });

  afterEach(restore);

  describe('date', function() {

    it('initial value is undefined', function() {
      expect(dialog.date).to.equal(undefined);
    });

    it('can be set to Date', function() {
      let date = new Date();

      dialog.date = date;

      expect(client.calls({op: 'set'})[0].properties.date).to.equal(date.getTime());
    });

    it('can only be set to Date', function() {
      expect(() => dialog.date = 'foo').to.throw();
    });

  });

  describe('minDate', function() {

    it('initial value is undefined', function() {
      expect(dialog.minDate).to.equal(undefined);
    });

    it('can be set to minDate', function() {
      let date = new Date();

      dialog.minDate = date;

      expect(client.calls({op: 'set'})[0].properties.minDate).to.equal(date.getTime());
    });

    it('can only be set to minDate', function() {
      expect(() => dialog.minDate = 'foo').to.throw();
    });

  });

  describe('maxDate', function() {

    it('initial value is undefined', function() {
      expect(dialog.maxDate).to.equal(undefined);
    });

    it('can be set to maxDate', function() {
      let date = new Date();

      dialog.maxDate = date;

      expect(client.calls({op: 'set'})[0].properties.maxDate).to.equal(date.getTime());
    });

    it('can only be set to maxDate', function() {
      expect(() => dialog.maxDate = 'foo').to.throw();
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
      let close = spy();
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close');

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog});
    });

  });

  describe('select event', function() {

    it('fires select and close', function() {
      let date = new Date();
      let select = spy();
      let close = spy();
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

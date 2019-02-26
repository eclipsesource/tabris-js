import {expect, mockTabris, restore, spy} from '../test';
import ClientStub from './ClientStub';
import TimeDialog from '../../src/tabris/TimeDialog';
import {createJsxProcessor} from '../../src/tabris/JsxProcessor';

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

    describe('as static method', () => {

      it('returns timeDialog', () => {
        expect(TimeDialog.open(dialog)).to.equal(dialog);
      });

      it('calls open', () => {
        TimeDialog.open(dialog);
        expect(client.calls({op: 'call'})[0].method).to.equal('open');
      });

      it('creates timeDialog for date', () => {
        const date = new Date(2001, 1, 1, 22, 30);
        const newDialog = TimeDialog.open(date);

        expect(newDialog).to.be.instanceof(TimeDialog);
        expect(newDialog.date.toString()).to.equal(date.toString());
        expect(client.calls({op: 'call', id: newDialog.cid})[0].method).to.equal('open');
      });

      it('creates timeDialog for no parameter', () => {
        const newDialog = TimeDialog.open();

        expect(newDialog).to.be.instanceof(TimeDialog);
        expect(newDialog.date).to.equal(null);
        expect(client.calls({op: 'call', id: newDialog.cid})[0].method).to.equal('open');
      });

      it('throws if timeDialog was closed', () => {
        dialog.open();
        dialog.close();
        expect(() => TimeDialog.open(dialog)).to.throw('Can not open a popup that was disposed');
      });

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

    it('dialog always listens to select', function() {
      expect(client.calls({op: 'listen'})[1]).to.deep.equal({
        op: 'listen',
        id: dialog.cid,
        event: 'select',
        listen: true
      });
    });

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

  describe('JSX', () => {

    let jsx;

    beforeEach(function() {
      jsx = createJsxProcessor();
    });

    it('with no properties', function() {
      const popup = jsx.createElement(TimeDialog);

      expect(popup).to.be.instanceOf(TimeDialog);
      expect(dialog.date).to.equal(null);
    });

    it('with date property', function() {
      const date = new Date(2000, 1, 1, 22, 30);

      const popup = jsx.createElement(
        TimeDialog,
        {date}
      );

      expect(popup.date.toString()).to.equal(date.toString());
    });

  });

});

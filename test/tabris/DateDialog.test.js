import {expect, mockTabris, restore, spy} from '../test';
import ClientMock from './ClientMock';
import DateDialog from '../../src/tabris/DateDialog';
import {createJsxProcessor} from '../../src/tabris/JsxProcessor';

describe('DateDialog', function() {

  let client, dialog;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    dialog = new DateDialog();
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

  describe('minDate', function() {

    it('initial value is null', function() {
      expect(dialog.minDate).to.equal(null);
    });

    it('can be set to minDate', function() {
      const date = new Date();

      dialog.minDate = date;

      expect(client.calls({op: 'set'})[0].properties.minDate).to.equal(date.getTime());
    });

    it('can only be set to minDate', function() {
      expect(() => dialog.minDate = 'foo').to.throw();
    });

  });

  describe('maxDate', function() {

    it('initial value is null', function() {
      expect(dialog.maxDate).to.equal(null);
    });

    it('can be set to maxDate', function() {
      const date = new Date();

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

    describe('as static method', () => {

      it('returns dateDialog', () => {
        expect(DateDialog.open(dialog)).to.equal(dialog);
      });

      it('calls open', () => {
        DateDialog.open(dialog);
        expect(client.calls({op: 'call'})[0].method).to.equal('open');
      });

      it('creates dateDialog for date', () => {
        const date = new Date(2001, 1);
        const newDialog = DateDialog.open(date);

        expect(newDialog).to.be.instanceof(DateDialog);
        expect(newDialog.date.toString()).to.equal(date.toString());
        expect(client.calls({op: 'call', id: newDialog.cid})[0].method).to.equal('open');
      });

      it('creates dateDialog for no parameter', () => {
        const newDialog = DateDialog.open();

        expect(newDialog).to.be.instanceof(DateDialog);
        expect(newDialog.date).to.equal(null);
        expect(client.calls({op: 'call', id: newDialog.cid})[0].method).to.equal('open');
      });

      it('throws if dateDialog was closed', () => {
        dialog.open();
        dialog.close();
        expect(() => DateDialog.open(dialog)).to.throw('Can not open a popup that was disposed');
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
      const popup = jsx.createElement(DateDialog);

      expect(popup).to.be.instanceOf(DateDialog);
      expect(dialog.date).to.equal(null);
      expect(dialog.maxDate).to.equal(null);
      expect(dialog.minDate).to.equal(null);
    });

    it('with all properties', function() {
      const date1 = new Date(2000, 1);
      const date2 = new Date(2000, 2);
      const date3 = new Date(2000, 3);

      const popup = jsx.createElement(
        DateDialog,
        {date: date1, minDate: date2, maxDate: date3}
      );

      expect(popup.date.toString()).to.equal(date1.toString());
      expect(popup.minDate.toString()).to.equal(date2.toString());
      expect(popup.maxDate.toString()).to.equal(date3.toString());
    });

  });

});

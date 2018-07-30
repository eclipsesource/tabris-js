import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientStub from '../ClientStub';
import AlertDialog from '../../../src/tabris/AlertDialog';
import TextInput from '../../../src/tabris/widgets/TextInput';
import Button from '../../../src/tabris/widgets/Button';

describe('AlertDialog', function() {

  let client, dialog;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    dialog = new AlertDialog();
  });

  afterEach(restore);

  describe('title', function() {

    it('initial value is empty string', function() {
      expect(dialog.title).to.equal('');
    });

    it('can be set to string', function() {
      dialog.title = 'foo';
      expect(dialog.title).to.equal('foo');
      expect(client.calls({op: 'set'})[0].properties.title).to.equal('foo');
    });

  });

  describe('message', function() {

    it('initial value is empty string', function() {
      expect(dialog.message).to.equal('');
    });

    it('can be set to string', function() {
      dialog.message = 'foo';
      expect(dialog.message).to.equal('foo');
      expect(client.calls({op: 'set'})[0].properties.message).to.equal('foo');
    });

  });

  describe('textInputs', function() {

    it('initial value is null', function() {
      expect(dialog.textInputs).to.equal(null);
    });

    it('can be set to array of TextInputs', function() {
      let textInput = new TextInput();

      dialog.textInputs = [textInput];

      expect(client.calls({op: 'set'})[0].properties.textInputs).to.deep.equal([textInput.cid]);
    });

    it('can not be set to different type ', function() {
      stub(console, 'warn');

      dialog.textInputs = [new Button()];

      let calls = client.calls({op: 'set', id: dialog.cid});
      expect(calls.length).to.equal(0);
      expect(console.warn).to.have.been.calledOnce;
    });

    it('can be gotten as array of TextInputs', function() {
      let textInput = new TextInput();
      let textInputs = [textInput];

      dialog.textInputs = textInputs;

      expect(dialog.textInputs).to.deep.equal(textInputs);
    });

    it('should be disposed when dialog is disposed', function() {
      let textInput = new TextInput();
      dialog.textInputs = [textInput];

      dialog.dispose();

      expect(textInput.isDisposed()).to.equal(true);
    });

  });

  describe('buttons', function() {

    it('initial value is empty object', function() {
      expect(dialog.buttons).to.deep.equal({});
    });

    it('rejects non-objects', function() {
      stub(console, 'warn');

      dialog.buttons = 123;

      expect(dialog.buttons).to.deep.equal({});
      expect(console.warn).to.have.been.calledWith(
        'AlertDialog: Ignored unsupported value for property "buttons": value is not an object'
      );
    });

    it('value object is normalized', function() {
      dialog.buttons = {
        ok: undefined,
        cancel: 23,
        neutral: null,
        doesNotExist: 'bar'
      };

      let expected = {
        ok: 'undefined',
        cancel: '23',
        neutral: 'null'
      };
      expect(dialog.buttons).to.deep.equal(expected);
      expect(client.calls({op: 'set'})[0].properties.buttons).to.deep.equal(expected);
    });

    it('does not include unset buttons', function() {
      dialog.buttons = {ok: 'foo'};
      expect(dialog.buttons).to.deep.equal({ok: 'foo'});
      expect(client.calls({op: 'set'})[0].properties.buttons).to.deep.equal({ok: 'foo'});
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

    it('dialog always LISTENs to close', function() {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: dialog.cid,
        event: 'close',
        listen: true
      });
    });

    it('with button fires close<Button> and close', function() {
      let closeOk = spy();
      let close = spy();
      dialog.onCloseOk(closeOk);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close', {button: 'ok'});

      expect(closeOk).to.have.been.calledOnce;
      expect(closeOk).to.have.been.calledWithMatch({target: dialog});
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog, button: 'ok'});
    });

    it('without button fires close only', function() {
      let closeOk = spy();
      let close = spy();
      dialog.onCloseOk(closeOk);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close', {});

      expect(closeOk).not.to.have.been.called;
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog, button: ''});
    });

  });

});

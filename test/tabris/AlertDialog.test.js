import {expect, mockTabris, restore, spy, stub} from './../test';
import ClientMock from './ClientMock';
import AlertDialog from './../../src/tabris/AlertDialog';
import TextInput from './../../src/tabris/widgets/TextInput';
import Button from './../../src/tabris/widgets/Button';
import {createJsxProcessor} from '../../src/tabris/JsxProcessor';
import ContentView from '../../src/tabris/widgets/ContentView';
import Composite from '../../src/tabris/widgets/Composite';

describe('AlertDialog', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {AlertDialog} */
  let dialog;

  beforeEach(function() {
    client = new ClientMock();
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
      expect(client.calls({op: 'create', id: dialog.cid})[0].properties.title).to.equal('foo');
    });

  });

  describe('message', function() {

    it('initial value is empty string', function() {
      expect(dialog.message).to.equal('');
    });

    it('can be set to string', function() {
      dialog.message = 'foo';
      expect(dialog.message).to.equal('foo');
      expect(client.calls({op: 'create', id: dialog.cid})[0].properties.message).to.equal('foo');
    });

  });

  describe('textInputs', function() {

    it('is a contentView', function() {
      expect(dialog.textInputs).to.be.instanceof(ContentView);
      expect(dialog.textInputs.children().length).to.equal(0);
      expect(dialog.textInputs.layout).to.be.null;
    });

    it('does not CREATE anything', function() {
      expect(dialog.textInputs.cid).to.not.be.empty;
      expect(client.calls({op: 'create', id: dialog.textInputs.cid}).length).equal(0);
    });

    it('can not be set directly', function() {
      const composite = new Composite();
      client.resetCalls();
      spy(console, 'warn');

      // @ts-ignore
      dialog.textInputs = composite;

      expect(console.warn).to.have.been.calledWithMatch(/Property "textInputs" can not be set, append to it instead/);
      expect(client.calls().length).to.equal(0);
    });

    it('can not be disposed', function() {
      const textInputs = dialog.textInputs;

      expect(() => textInputs.dispose()).to.throw();
    });

    it('can add TextInputs', function() {
      const textInput = new TextInput();
      client.resetCalls();

      dialog.textInputs.append(textInput);
      dialog.open();

      expect(client.calls({
        op: 'set',
        id: dialog.cid
      })[0].properties.textInputs).to.deep.equal([textInput.cid]);
    });

    it('can not add other types', function() {
      const button = new Button();
      client.resetCalls();

      expect(() => dialog.textInputs.append(button)).to.throw();
    });

    it('should be disposed when dialog is disposed', function() {
      const textInput = new TextInput();
      dialog.textInputs.append(textInput);

      dialog.dispose();

      expect(dialog.textInputs.isDisposed()).to.equal(true);
    });

    it('does not access nativeBridge', function() {
      client.resetCalls();
      dialog.textInputs.animate({}, {});
      dialog.textInputs.onResize(() => {});
      dialog.textInputs.enabled = false;
      dialog.textInputs.bounds;
      dialog.dispose();

      expect(client.calls({id: dialog.textInputs.cid}).length).to.equal(0);
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
      expect(console.warn).to.have.been.calledWithMatch(
        'AlertDialog: Ignored unsupported value for property "buttons": 123 is not an object'
      );
    });

    it('value object is normalized', function() {
      dialog.buttons = {
        ok: undefined,
        cancel: 23,
        neutral: null
      };

      const expected = {
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

    describe('as static method', () => {

      it('returns alertDialog', () => {
        expect(AlertDialog.open(dialog)).to.equal(dialog);
      });

      it('calls open', () => {
        AlertDialog.open(dialog);
        expect(client.calls({op: 'call'})[0].method).to.equal('open');
      });

      it('creates alertDialog for other values', () => {
        const newDialog = AlertDialog.open('Hello World!');

        expect(newDialog).to.be.instanceof(AlertDialog);
        expect(newDialog.message).to.equal('Hello World!');
        expect(newDialog.buttons).to.deep.equal({ok: 'OK'});
        expect(client.calls({op: 'call', id: newDialog.cid})[0].method).to.equal('open');
      });

      it('throws if alertDialog was closed', () => {
        dialog.open();
        dialog.close();
        expect(() => AlertDialog.open(dialog)).to.throw('Can not open a popup that was disposed');
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

    it('dialog always LISTENs to close', function() {
      expect(client.calls({op: 'listen'})[0]).to.deep.equal({
        op: 'listen',
        id: dialog.cid,
        event: 'close',
        listen: true
      });
    });

    it('with button fires close<Button> and close', function() {
      const closeOk = spy();
      const close = spy();
      dialog.onCloseOk(closeOk);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close', {button: 'ok'});

      expect(closeOk).to.have.been.calledOnce;
      expect(closeOk).to.have.been.calledWithMatch({target: dialog});
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog, button: 'ok'});
    });

    it('without button fires close only', function() {
      const closeOk = spy();
      const close = spy();
      dialog.onCloseOk(closeOk);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close', {});

      expect(closeOk).not.to.have.been.called;
      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({target: dialog, button: null, texts: []});
    });

    it('contain texts', function() {
      const textInput = new TextInput();
      stub(client, 'get').withArgs(textInput.cid, 'text').returns('foo');
      dialog.textInputs.append(textInput);
      const closeOk = spy();
      const close = spy();
      dialog.onCloseOk(closeOk);
      dialog.onClose(close);

      tabris._notify(dialog.cid, 'close', {button: 'ok'});

      expect(close).to.have.been.calledOnce;
      expect(close).to.have.been.calledWithMatch({texts: ['foo']});
      expect(closeOk).to.have.been.calledOnce;
      expect(closeOk).to.have.been.calledWithMatch({texts: ['foo']});
    });

  });

  describe('JSX', () => {

    let jsx;

    beforeEach(function() {
      jsx = createJsxProcessor();
    });

    it('with message property', function() {
      const popup = jsx.createElement(
        AlertDialog,
        {message: 'Hello World!'}
      );

      expect(popup).to.be.instanceOf(AlertDialog);
      expect(popup.message).to.equal('Hello World!');
    });

    it('with text content', function() {
      const popup = jsx.createElement(
        AlertDialog,
        null,
        'Hello  ',
        'World!'
      );

      expect(popup.message).to.equal('Hello  World!');
    });

    it('with text content and message property', function() {
      expect(() => jsx.createElement(
        AlertDialog,
        {message: 'Hello World!'},
        'Hello',
        'World!'
      )).to.throw(/message given twice/);
    });

    it('with children property', function() {
      const textInputs = [new TextInput(), new TextInput()];
      const popup = jsx.createElement(
        AlertDialog, {children: textInputs}
      );

      expect(popup.textInputs.children().length).to.equal(2);
      expect(popup.textInputs.children()[0]).to.equal(textInputs[0]);
      expect(popup.textInputs.children()[1]).to.equal(textInputs[1]);
    });

    it('with TextInput as content', function() {
      const textInputs = [new TextInput(), new TextInput()];
      const popup = jsx.createElement(
        AlertDialog,
        null,
        textInputs[0],
        textInputs[1]
      );

      expect(popup.textInputs.children().length).to.equal(2);
      expect(popup.textInputs.children()[0]).to.equal(textInputs[0]);
      expect(popup.textInputs.children()[1]).to.equal(textInputs[1]);
    });

    it('with children property and content', function() {
      expect(() => jsx.createElement(
        AlertDialog,
        {children: [new TextInput()]},
        new TextInput()
      )).to.throw('JSX: Children for type AlertDialog given twice.');
    });

  });

});

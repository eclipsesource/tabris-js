import {expect, mockTabris, restore, spy} from '../../test';
import ClientStub from '../ClientStub';
import TextInput from '../../../src/tabris/widgets/TextInput';

describe('TextInput', function() {

  let client;
  let widget;
  let listener;

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  function checkListen(event) {
    let listen = client.calls({op: 'listen', id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  beforeEach(function() {
    client = new ClientStub();
    client.get = (id, prop) => client.properties(id)[prop];
    mockTabris(client);
    listener = spy();
  });

  afterEach(function() {
    restore();
    delete tabris.TestType;
  });

  it('create', function() {
    new TextInput({text: 'foo'});

    expect(getCreate().type).to.equal('tabris.TextInput');
    expect(getCreate().properties).to.deep.equal({text: 'foo'});
  });

  it('constructor name', function() {
    let textInput = new TextInput({text: 'foo'});

    expect(textInput.constructor.name).to.equal('TextInput');
  });

  it('properties', function() {
    let textInput = new TextInput({text: 'foo'});

    expect(textInput.message).to.equal('');
    expect(textInput.alignment).to.equal('left');
    expect(textInput.keyboard).to.equal('default');
    expect(textInput.enterKeyType).to.equal('default');
    expect(textInput.autoCorrect).to.equal(false);
    expect(textInput.onTypeChanged).to.be.undefined;
  });

  describe('autoCapitalize', function() {

    it('should native set value to "none" when false given', function() {
      new TextInput({autoCapitalize: false});

      expect(getCreate().properties.autoCapitalize).to.equal('none');
    });

    it('should native set value to "all" when true given', function() {
      new TextInput({autoCapitalize: true});

      expect(getCreate().properties.autoCapitalize).to.equal('all');
    });

    it('should native set given value', function() {
      new TextInput({autoCapitalize: 'sentence'});

      expect(getCreate().properties.autoCapitalize).to.equal('sentence');
    });

  });

  it('input event', function() {
    widget = new TextInput().onInput(listener);

    tabris._notify(widget.cid, 'input', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
    checkListen('input');
  });

  it('accept event', function() {
    widget = new TextInput().onAccept(listener);

    tabris._notify(widget.cid, 'accept', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
    checkListen('accept');
  });

  describe('selection', function() {

    it('sets valid selection', function() {
      widget = new TextInput({text: 'foobar'});
      widget.selection = [1, 3];
      expect(widget.selection).to.deep.equal([1, 3]);
    });

    it('rejects invalid selection', function() {
      widget = new TextInput({text: 'foobar', selection: [1, 3]});
      [[-1, 3], [1, 10], [10, 3], [1, -1]].forEach(sel => {
        try {
          widget.selection = sel;
        } catch (ex) {
          // expected
        }
        expect(widget.selection).to.deep.equal([1, 3]);
      });
    });

    it('fires change event', function() {
      widget = new TextInput({text: 'foobar'}).onSelectionChanged(listener);

      widget.selection = [1, 3];

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, value: [1, 3]});
      checkListen('select');
    });
  });

  it('textChanged event', function() {
    widget = new TextInput().onTextChanged(listener);

    tabris._notify(widget.cid, 'input', {text: 'foo'});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: 'foo'});
    checkListen('input');
  });

});

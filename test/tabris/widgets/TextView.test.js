import {expect, mockTabris, restore, stub} from '../../test';
import ClientMock from '../ClientMock';
import TextView from '../../../src/tabris/widgets/TextView';
import {createJsxProcessor} from '../../../src/tabris/JsxProcessor';
import {toXML} from '../../../src/tabris/Console';

describe('TextView', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {TextView} */
  let widget;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(function() {
    restore();
  });

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  it('CREATEs TextView', function() {
    new TextView({text: 'foo'});

    expect(getCreate().type).to.equal('tabris.TextView');
    expect(getCreate().properties).to.deep.equal({text: 'foo'});
  });

  it('has default property values', function() {
    const textView = new TextView({text: 'foo'});

    expect(textView.constructor.name).to.equal('TextView');
    expect(textView.alignment).to.equal('left');
    expect(textView.markupEnabled).to.equal(false);
    expect(textView.maxLines).to.equal(null);
  });

  it('maxLines: 0 is mapped to null', function() {
    const textView = new TextView({text: 'foo', maxLines: 0});

    expect(textView.maxLines).to.be.null;
  });

  it('maxLines: values <= 0 are mapped to null', function() {
    const textView = new TextView({text: 'foo', maxLines: -1});

    expect(textView.maxLines).to.be.null;
  });

  it('SETs equal text colors only once', function() {
    const textView = new TextView({textColor: 'blue'});
    tabris.flush();
    client.resetCalls();

    textView.set({textColor: 'blue'});

    expect(client.calls({op: 'set'}).length).to.equal(0);
  });

  describe('JSX', function() {

    /** @type {import('../../../src/tabris/JsxProcessor').default} */
    let jsx;

    beforeEach(function() {
      client = new ClientMock();
      mockTabris(client);
      jsx = createJsxProcessor();
    });

    it('creates widget with text property as-is', function() {
      const widget = jsx.createElement(
        TextView,
        {text: 'Hello <br/> World!'}
      );

      expect(widget.text).to.equal('Hello <br/> World!');
    });

    it('creates widget with text content as-is', function() {
      const button = jsx.createElement(
        TextView,
        null,
        '  Hello',
        '  <br/>  ',
        'World!'
      );

      expect(button.text).to.equal('  Hello  <br/>  World!');
    });

    it('creates widget with processed text content with markup enabled', function() {
      const button = jsx.createElement(
        TextView,
        {markupEnabled: true},
        '  Hello',
        '  <br/>  ',
        'World!'
      );

      expect(button.text).to.equal(' Hello<br/>World!');
    });

    it('fails to create widget with text content and text property', function() {
      expect(() => jsx.createElement(
        TextView,
        {text: 'Hello World!'},
        'Hello',
        'World!'
      )).to.throw(/text given twice/);
    });

  });

  describe('toXML', function() {

    it('prints xml element with markupEnabled false', function() {
      widget = new TextView({text: 'f\'oo'});
      stub(client, 'get').returns({});
      expect(widget[toXML]()).to.match(/<TextView .* text='f\\'oo'\/>/);
    });

    it('prints xml element with markupEnabled true', function() {
      widget = new TextView({text: 'f\'o\no', markupEnabled: true});
      stub(client, 'get').returns([0, 1, 2, 3]);
      expect(widget[toXML]()).to.equal(
        `<TextView cid='${widget.cid}' bounds='{left: 0, top: 1, width: 2, height: 3}' markupEnabled='true'>\n` +
        '  f\'o\n' +
        '  o\n' +
        '</TextView>'
      );
    });

  });

});

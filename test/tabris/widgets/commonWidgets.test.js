import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import Composite from '../../../src/tabris/widgets/Composite';
import Button from '../../../src/tabris/widgets/Button';
import CheckBox from '../../../src/tabris/widgets/CheckBox';
import ImageView from '../../../src/tabris/widgets/ImageView';
import ProgressBar from '../../../src/tabris/widgets/ProgressBar';
import RadioButton from '../../../src/tabris/widgets/RadioButton';
import Slider from '../../../src/tabris/widgets/Slider';
import TextInput from '../../../src/tabris/widgets/TextInput';
import Switch from '../../../src/tabris/widgets/Switch';
import ToggleButton from '../../../src/tabris/widgets/ToggleButton';
import WebView from '../../../src/tabris/widgets/WebView';
import ActivityIndicator from '../../../src/tabris/widgets/ActivityIndicator';
import {createJsxProcessor} from '../../../src/tabris/JsxProcessor';
import {toXML} from '../../../src/tabris/Console';

describe('Common Widgets', function() {

  let client;
  let widget;
  let listener;
  let jsx;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    listener = spy();
    jsx = createJsxProcessor();
  });

  afterEach(function() {
    restore();
    delete tabris.TestType;
  });

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  function checkListen(event) {
    const listen = client.calls({op: 'listen', id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  it('ActivityIndicator', function() {
    const activityIndicator = new ActivityIndicator();

    expect(getCreate().type).to.equal('tabris.ActivityIndicator');
    expect(activityIndicator.constructor.name).to.equal('ActivityIndicator');
  });

  it('Button', function() {
    const button = new Button({enabled: false});

    expect(getCreate().type).to.equal('tabris.Button');
    expect(button.constructor.name).to.equal('Button');
    expect(button.image).to.equal(null);
    expect(button.alignment).to.equal('centerX');
    expect(button.text).to.equal('');
  });

  it('Button select', function() {
    widget = new Button().onSelect(listener);

    tabris._notify(widget.cid, 'select', {});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget});
    checkListen('select');
  });

  it('Button JSX with text property', function() {
    const button = jsx.createElement(
      Button,
      {text: 'Hello World!'}
    );

    expect(button.text).to.equal('Hello World!');
  });

  it('Button JSX with text content', function() {
    const button = jsx.createElement(
      Button,
      null,
      'Hello  ',
      'World!'
    );

    expect(button.text).to.equal('Hello  World!');
  });

  it('Button JSX with text content and text property', function() {
    expect(() => jsx.createElement(
      Button,
      {text: 'Hello World!'},
      'Hello',
      'World!'
    )).to.throw(/text given twice/);
  });

  it('Button toXML prints xml element with text', function() {
    widget = new Button({text: 'foo'});
    stub(client, 'get').withArgs(widget.cid, 'bounds').returns({});
    expect(widget[toXML]()).to.match(/<Button .* text='foo'\/>/);
  });

  it('CheckBox', function() {
    const checkBox = new CheckBox({enabled: false});

    expect(getCreate().type).to.equal('tabris.CheckBox');
    expect(checkBox.constructor.name).to.equal('CheckBox');
    expect(checkBox.text).to.equal('');
  });

  it('CheckBox select', function() {
    widget = new CheckBox().onSelect(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('CheckBox checkedChanged', function() {
    widget = new CheckBox().onCheckedChanged(listener);
    tabris._notify(widget.cid, 'select', {checked: true});
    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('CheckBox JSX with text property', function() {
    const checkBox = jsx.createElement(
      CheckBox,
      {text: 'Hello World!'}
    );

    expect(checkBox.text).to.equal('Hello World!');
  });

  it('CheckBox JSX with text content', function() {
    const checkBox = jsx.createElement(
      CheckBox,
      null,
      'Hello  ',
      'World!'
    );

    expect(checkBox.text).to.equal('Hello  World!');
  });

  it('CheckBox JSX with text content and text property', function() {
    expect(() => jsx.createElement(
      CheckBox,
      {text: 'Hello World!'},
      'Hello',
      'World!'
    )).to.throw(/text given twice/);
  });

  it('CheckBox toXML prints xml element with text and checked', function() {
    widget = new CheckBox({text: 'foo'});
    stub(client, 'get')
      .withArgs(widget.cid, 'bounds').returns({})
      .withArgs(widget.cid, 'checked').returns(false);
    expect(widget[toXML]()).to.match(/<CheckBox .* text='foo' checked='false'\/>/);
  });

  it('Composite', function() {
    const composite = new Composite();

    expect(getCreate().type).to.equal('tabris.Composite');
    expect(composite.constructor.name).to.equal('Composite');
  });

  it('ImageView', function() {
    const imageView = new ImageView();

    expect(getCreate().type).to.equal('tabris.ImageView');
    expect(imageView.constructor.name).to.equal('ImageView');
    expect(imageView.image).to.equal(null);
    expect(imageView.scaleMode).to.equal('auto');
  });

  it('ImageView toXML prints xml element with image src', function() {
    stub(client, 'get').returns({});
    expect(new ImageView()[toXML]()).to.match(/<ImageView .* image=''\/>/);
    expect(new ImageView({image: 'foo.jpg'})[toXML]()).to.match(/<ImageView .* image='foo.jpg'\/>/);
  });

  it('ProgressBar', function() {
    const progressBar = new ProgressBar();

    expect(getCreate().type).to.equal('tabris.ProgressBar');
    expect(progressBar.constructor.name).to.equal('ProgressBar');
    expect(progressBar.minimum).to.equal(0);
    expect(progressBar.maximum).to.equal(100);
    expect(progressBar.selection).to.equal(0);
    expect(progressBar.state).to.equal('normal');
  });

  it('ProgressBar toXML prints xml element with minimum, maximum and selection', function() {
    widget = new ProgressBar({minimum: 10, maximum: 20, selection: 13});
    stub(client, 'get').returns({});
    expect(widget[toXML]()).to.match(/<ProgressBar .* selection='13' minimum='10' maximum='20'\/>/);
  });

  it('RadioButton', function() {
    const radioButton = new RadioButton({enabled: false});

    expect(getCreate().type).to.equal('tabris.RadioButton');
    expect(radioButton.constructor.name).to.equal('RadioButton');
    expect(radioButton.text).to.equal('');
  });

  it('RadioButton select', function() {
    widget = new RadioButton().onSelect(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('RadioButton checkedChanged', function() {
    widget = new RadioButton().onCheckedChanged(listener);
    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('RadioButton JSX with text property', function() {
    const radioButton = jsx.createElement(
      RadioButton,
      {text: 'Hello World!'}
    );

    expect(radioButton.text).to.equal('Hello World!');
  });

  it('RadioButton JSX with text content', function() {
    const button = jsx.createElement(
      RadioButton,
      null,
      'Hello  ',
      'World!'
    );

    expect(button.text).to.equal('Hello  World!');
  });

  it('RadioButton JSX with text content and text property', function() {
    expect(() => jsx.createElement(
      RadioButton,
      {text: 'Hello World!'},
      'Hello',
      'World!'
    )).to.throw(/text given twice/);
  });

  it('RadioButton toXML prints xml element with text and checked', function() {
    widget = new RadioButton({text: 'foo'});
    stub(client, 'get')
      .withArgs(widget.cid, 'bounds').returns({})
      .withArgs(widget.cid, 'checked').returns(false);
    expect(widget[toXML]()).to.match(/<RadioButton .* text='foo' checked='false'\/>/);
  });

  it('Slider', function() {
    const slider = new Slider({selection: 23});

    expect(getCreate().type).to.equal('tabris.Slider');
    expect(getCreate().properties).to.deep.equal({selection: 23});
    expect(slider.constructor.name).to.equal('Slider');
    expect(slider.minimum).to.equal(0);
    expect(slider.maximum).to.equal(100);
  });

  it('Slider select', function() {
    widget = new Slider().onSelect(listener);

    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, selection: 23});
    checkListen('select');
  });

  it('Slider selectionChanged', function() {
    widget = new Slider().onSelectionChanged(listener);
    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: 23});
    checkListen('select');
  });

  it('Slider toXML prints xml element with minimum, maximum and selection', function() {
    widget = new Slider({minimum: 10, maximum: 20, selection: 13});
    stub(client, 'get').returns(13);
    expect(widget[toXML]()).to.match(/<Slider .* selection='13' minimum='10' maximum='20'\/>/);
  });

  it('WebView', function() {
    const webView = new WebView({html: 'foo'});

    expect(getCreate().type).to.equal('tabris.WebView');
    expect(getCreate().properties).to.deep.equal({html: 'foo'});
    expect(webView.constructor.name).to.equal('WebView');
  });

  it('WebView toXML prints xml element with url', function() {
    widget = new WebView();
    stub(client, 'get')
      .withArgs(widget.cid, 'url').returns('foo.com')
      .withArgs(widget.cid, 'html').returns('')
      .withArgs(widget.cid, 'bounds').returns([0, 1, 2, 3]);
    expect(widget[toXML]()).to.match(/<WebView .* url='foo.com'\/>/);
  });

  it('WebView toXML prints xml element with html', function() {
    widget = new WebView();
    stub(client, 'get')
      .withArgs(widget.cid, 'html').returns('<html>\n  <body>\n    Hello World!\n  </body>\n</html>')
      .withArgs(widget.cid, 'url').returns('')
      .withArgs(widget.cid, 'bounds').returns([0, 1, 2, 3]);
    expect(widget[toXML]()).to.equal(
      `<WebView cid='${widget.cid}' bounds='{left: 0, top: 1, width: 2, height: 3}'>\n` +
      '  <html>\n' +
      '    <body>\n' +
      '      Hello World!\n' +
      '    </body>\n' +
      '  </html>\n' +
      '</WebView>'
    );
  });

  it('Switch', function() {
    const swtch = new Switch({checked: true});

    expect(getCreate().type).to.equal('tabris.Switch');
    expect(getCreate().properties).to.deep.equal({checked: true});
    expect(swtch.constructor.name).to.equal('Switch');
  });

  it('Switch checkedChanged', function() {
    widget = new Switch().onCheckedChanged(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('Switch checkedChanged on property change', function() {
    widget = new Switch().onCheckedChanged(listener);

    widget.checked = true;

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
  });

  it('Switch select', function() {
    widget = new Switch().onSelect(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('Switch toXML prints xml element with text and checked', function() {
    widget = new Switch({text: 'foo'});
    stub(client, 'get')
      .withArgs(widget.cid, 'bounds').returns({})
      .withArgs(widget.cid, 'checked').returns(false);
    expect(widget[toXML]()).to.match(/<Switch .* text='foo' checked='false'\/>/);
  });

  it('ToggleButton', function() {
    const toggleButton = new ToggleButton({enabled: false});

    expect(getCreate().type).to.equal('tabris.ToggleButton');
    expect(toggleButton.constructor.name).to.equal('ToggleButton');
    expect(toggleButton.text).to.equal('');
    expect(toggleButton.image).to.equal(null);
    expect(toggleButton.alignment).to.equal('centerX');
  });

  it('ToggleButton checkedChanged', function() {
    widget = new ToggleButton().onCheckedChanged(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('ToggleButton select', function() {
    widget = new ToggleButton().onSelect(listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('ToggleButton JSX with text property', function() {
    const toggleButton = jsx.createElement(
      ToggleButton,
      {text: 'Hello World!'}
    );

    expect(toggleButton.text).to.equal('Hello World!');
  });

  it('ToggleButton JSX with text content', function() {
    const button = jsx.createElement(
      ToggleButton,
      null,
      'Hello  ',
      'World!'
    );

    expect(button.text).to.equal('Hello  World!');
  });

  it('ToggleButton JSX with text content and text property', function() {
    expect(() => jsx.createElement(
      ToggleButton,
      {text: 'Hello World!'},
      'Hello',
      'World!'
    )).to.throw(/text given twice/);
  });

  it('ToggleButton toXML prints xml element with text and checked', function() {
    widget = new ToggleButton({text: 'foo'});
    stub(client, 'get')
      .withArgs(widget.cid, 'bounds').returns({})
      .withArgs(widget.cid, 'checked').returns(false);
    expect(widget[toXML]()).to.match(/<ToggleButton .* text='foo' checked='false'\/>/);
  });

  it('sets native color properties as RGBA arrays', function() {
    widget = new TextInput({text: 'foo', textColor: 'red'});

    expect(getCreate().properties.textColor).to.deep.equal([255, 0, 0, 255]);
  });

  it('resets native color properties by null', function() {
    widget = new TextInput({text: 'foo', textColor: 'red'});
    widget.textColor = 'initial';

    expect(getCreate().properties.textColor).to.be.null;
  });

});

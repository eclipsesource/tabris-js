import {expect, spy, stub, restore} from '../../test';
import ClientStub from '../ClientStub';
import ProxyStore from '../../../src/tabris/ProxyStore';
import NativeBridge from '../../../src/tabris/NativeBridge';
import Composite from '../../../src/tabris/widgets/Composite';
import Canvas from '../../../src/tabris/widgets/Canvas';
import Button from '../../../src/tabris/widgets/Button';
import CheckBox from '../../../src/tabris/widgets/CheckBox';
import ImageView from '../../../src/tabris/widgets/ImageView';
import ProgressBar from '../../../src/tabris/widgets/ProgressBar';
import RadioButton from '../../../src/tabris/widgets/RadioButton';
import Slider from '../../../src/tabris/widgets/Slider';
import TextView from '../../../src/tabris/widgets/TextView';
import TextInput from '../../../src/tabris/widgets/TextInput';
import Switch from '../../../src/tabris/widgets/Switch';
import ToggleButton from '../../../src/tabris/widgets/ToggleButton';
import WebView from '../../../src/tabris/widgets/WebView';
import ActivityIndicator from '../../../src/tabris/widgets/ActivityIndicator';

describe('Common Widgets', function() {

  let client;
  let widget;
  let listener;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore(),
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param)
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    listener = spy();
  });

  afterEach(function() {
    restore();
    delete tabris.TestType;
  });

  function getCreate() {
    return client.calls({op: 'create'})[0];
  }

  function checkListen(event) {
    let listen = client.calls({op: 'listen', id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  it('ActivityIndicator', function() {
    let activityIndicator = new ActivityIndicator();

    expect(getCreate().type).to.equal('tabris.ActivityIndicator');
    expect(activityIndicator.constructor.name).to.equal('ActivityIndicator');
  });

  it('Button', function() {
    let button = new Button({enabled: false});

    expect(getCreate().type).to.equal('tabris.Button');
    expect(button.constructor.name).to.equal('Button');
    expect(button.get('image')).to.equal(null);
    expect(button.get('alignment')).to.equal('center');
    expect(button.get('text')).to.equal('');
  });

  it('Button select', function() {
    widget = new Button().on('select', listener);

    tabris._notify(widget.cid, 'select', {});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget});
    checkListen('select');
  });

  it('Canvas', function() {
    let canvas = new Canvas();

    expect(getCreate().type).to.eql('tabris.Canvas');
    expect(canvas.constructor.name).to.equal('Canvas');
  });

  it('CheckBox', function() {
    let checkBox = new CheckBox({enabled: false});

    expect(getCreate().type).to.eql('tabris.CheckBox');
    expect(checkBox.constructor.name).to.equal('CheckBox');
    expect(checkBox.get('text')).to.equal('');
  });

  it('CheckBox select', function() {
    widget = new CheckBox().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('CheckBox change:checked', function() {
    widget = new CheckBox().on('change:checked', listener);
    tabris._notify(widget.cid, 'select', {checked: true});
    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, 'value': true});
    checkListen('select');
  });

  it('Composite', function() {
    let composite = new Composite();

    expect(getCreate().type).to.eql('tabris.Composite');
    expect(composite.constructor.name).to.equal('Composite');
  });

  it('ImageView', function() {
    let imageView = new ImageView();

    expect(getCreate().type).to.eql('tabris.ImageView');
    expect(imageView.constructor.name).to.equal('ImageView');
    expect(imageView.get('image')).to.equal(null);
    expect(imageView.get('scaleMode')).to.equal('auto');
  });

  it('ProgressBar', function() {
    let progressBar = new ProgressBar();

    expect(getCreate().type).to.eql('tabris.ProgressBar');
    expect(progressBar.constructor.name).to.equal('ProgressBar');
    expect(progressBar.get('minimum')).to.equal(0);
    expect(progressBar.get('maximum')).to.equal(100);
    expect(progressBar.get('selection')).to.equal(0);
    expect(progressBar.get('state')).to.equal('normal');
  });

  it('RadioButton', function() {
    let radioButton = new RadioButton({enabled: false});

    expect(getCreate().type).to.eql('tabris.RadioButton');
    expect(radioButton.constructor.name).to.equal('RadioButton');
    expect(radioButton.get('text')).to.equal('');
  });

  it('RadioButton select', function() {
    widget = new RadioButton().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('RadioButton change:checked', function() {
    widget = new RadioButton().on('change:checked', listener);
    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('TextView', function() {
    let textView = new TextView({text: 'foo'});

    expect(getCreate().type).to.eql('tabris.TextView');
    expect(getCreate().properties).to.eql({text: 'foo'});
    expect(textView.constructor.name).to.equal('TextView');
    expect(textView.get('alignment')).to.equal('left');
    expect(textView.get('markupEnabled')).to.equal(false);
    expect(textView.get('maxLines')).to.equal(null);
  });

  it('TextView, maxLines: 0 is mapped to null', function() {
    new TextView({text: 'foo', maxLines: 0});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it('TextView, maxLines: values <= 0 are mapped to null', function() {
    new TextView({text: 'foo', maxLines: -1});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it('Slider', function() {
    let slider = new Slider({selection: 23});

    expect(getCreate().type).to.eql('tabris.Slider');
    expect(getCreate().properties).to.eql({selection: 23});
    expect(slider.constructor.name).to.equal('Slider');
    expect(slider.get('minimum')).to.equal(0);
    expect(slider.get('maximum')).to.equal(100);
  });

  it('Slider select', function() {
    widget = new Slider().on('select', listener);

    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, selection: 23});
    checkListen('select');
  });

  it('Slider change:selection', function() {
    widget = new Slider().on('change:selection', listener);
    tabris._notify(widget.cid, 'select', {selection: 23});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: 23});
    checkListen('select');
  });

  describe('TextInput', function() {

    it('create', function() {
      new TextInput({text: 'foo'});

      expect(getCreate().type).to.eql('tabris.TextInput');
      expect(getCreate().properties).to.eql({text: 'foo'});
    });

    it('constructor name', function() {
      let textInput = new TextInput({text: 'foo'});

      expect(textInput.constructor.name).to.equal('TextInput');
    });

    it('properties', function() {
      let textInput = new TextInput({text: 'foo'});

      expect(textInput.get('message')).to.equal('');
      expect(textInput.get('alignment')).to.equal('left');
      expect(textInput.get('keyboard')).to.equal('default');
      expect(textInput.get('autoCorrect')).to.equal(false);
    });

    it('autoCapitalize property', function() {
      let textInput = new TextInput({text: 'foo'});
      stub(client, 'get', () => false);

      expect(textInput.get('autoCapitalize')).to.equal(false);
      expect(client.get).to.have.been.called;
    });

    it('input event', function() {
      widget = new TextInput().on('input', listener);

      tabris._notify(widget.cid, 'input', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
      checkListen('input');
    });

    it('accept event', function() {
      widget = new TextInput().on('accept', listener);

      tabris._notify(widget.cid, 'accept', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, text: 'foo'});
      checkListen('accept');
    });

    it('change:text event', function() {
      widget = new TextInput().on('change:text', listener);

      tabris._notify(widget.cid, 'input', {text: 'foo'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: widget, value: 'foo'});
      checkListen('input');
    });

  });

  it('WebView', function() {
    let webView = new WebView({html: 'foo'});

    expect(getCreate().type).to.eql('tabris.WebView');
    expect(getCreate().properties).to.eql({html: 'foo'});
    expect(webView.constructor.name).to.equal('WebView');
  });

  it('Switch', function() {
    let swtch = new Switch({checked: true});

    expect(getCreate().type).to.eql('tabris.Switch');
    expect(getCreate().properties).to.eql({checked: true});
    expect(swtch.constructor.name).to.equal('Switch');
  });

  it('Switch change:checked', function() {
    widget = new Switch().on('change:checked', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('Switch change:checked on property change', function() {
    widget = new Switch().on('change:checked', listener);

    widget.set('checked', true);

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
  });

  it('Switch select', function() {
    widget = new Switch().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

  it('ToggleButton', function() {
    let toggleButton = new ToggleButton({enabled: false});

    expect(getCreate().type).to.eql('tabris.ToggleButton');
    expect(toggleButton.constructor.name).to.equal('ToggleButton');
    expect(toggleButton.get('text')).to.equal('');
    expect(toggleButton.get('image')).to.equal(null);
    expect(toggleButton.get('alignment')).to.equal('center');
  });

  it('ToggleButton change:checked', function() {
    widget = new ToggleButton().on('change:checked', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, value: true});
    checkListen('select');
  });

  it('ToggleButton select', function() {
    widget = new ToggleButton().on('select', listener);

    tabris._notify(widget.cid, 'select', {checked: true});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: widget, checked: true});
    checkListen('select');
  });

});

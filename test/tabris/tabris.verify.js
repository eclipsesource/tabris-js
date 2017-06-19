global.self = global;
const {expect} = require('chai');
const {copySync, removeSync} = require('fs-extra');
const tabris = require('../../build/tabris');

const window = global.window;

describe('global object', function() {

  it('contains Promise', function() {
    expect(global.Promise).to.be.a('function');
  });

  it('contains fetch', function() {
    expect(global.fetch).to.be.a('function');
  });

});

describe('window', function() {

  it('is the global object', function() {
    expect(window).to.equal(global);
  });

  it('contains timer methods', function() {
    expect(window.clearInterval).to.be.a('function');
    expect(window.clearTimeout).to.be.a('function');
    expect(window.setInterval).to.be.a('function');
    expect(window.setTimeout).to.be.a('function');
  });

  it('contains DOM EventTarget API', function() {
    expect(window.addEventListener).to.be.a('function');
    expect(window.removeEventListener).to.be.a('function');
    expect(window.dispatchEvent).to.be.a('function');
  });

  it('contains DOM API constructors', function() {
    expect(window.Crypto).to.be.a('function');
    expect(window.Crypto.name).to.equal('Crypto');
    expect(window.ImageData).to.be.a('function');
    expect(window.ImageData.name).to.equal('ImageData');
    expect(window.ProgressEvent).to.be.a('function');
    expect(window.ProgressEvent.name).to.equal('ProgressEvent');
    expect(window.Storage).to.be.a('function');
    expect(window.Storage.name).to.equal('Storage');
    expect(window.WebSocket).to.be.a('function');
    expect(window.WebSocket.name).to.equal('WebSocket');
    // http
    expect(window.Headers).to.be.a('function');
    expect(window.Headers.name).to.equal('Headers');
    expect(window.Request).to.be.a('function');
    expect(window.Request.name).to.equal('Request');
    expect(window.Response).to.be.a('function');
    expect(window.Response.name).to.equal('Response');
    expect(window.XMLHttpRequest).to.be.a('function');
    expect(window.XMLHttpRequest.name).to.equal('XMLHttpRequest');
  });

});

describe('tabris', function() {

  it('throws when loaded twice', function() {
    copySync('build/tabris', 'build/tabris-copy');
    expect(() => require('../../build/tabris-copy')).to.throw('tabris module already loaded');
    removeSync('build/tabris-copy');
  });

  it('contains version', function() {
    expect(tabris.version).to.match(/\d+\.\d+\.\d+/);
  });

  it('is started', function() {
    expect(tabris.started).to.be.true;
  });

  it('contains DOM API constructors', function() {
    expect(tabris.Crypto).to.be.a('function');
    expect(tabris.Crypto.name).to.equal('Crypto');
    expect(tabris.Event).to.be.a('function');
    expect(tabris.Event.name).to.equal('Event');
    expect(tabris.ImageData).to.be.a('function');
    expect(tabris.ImageData.name).to.equal('ImageData');
    expect(tabris.ProgressEvent).to.be.a('function');
    expect(tabris.ProgressEvent.name).to.equal('ProgressEvent');
    expect(tabris.Storage).to.be.a('function');
    expect(tabris.Storage.name).to.equal('Storage');
    expect(window.WebSocket).to.be.a('function');
    expect(tabris.WebSocket.name).to.equal('WebSocket');
    // http
    expect(tabris.Headers).to.be.a('function');
    expect(tabris.Headers.name).to.equal('Headers');
    expect(tabris.Request).to.be.a('function');
    expect(tabris.Request.name).to.equal('Request');
    expect(tabris.Response).to.be.a('function');
    expect(tabris.Response.name).to.equal('Response');
    expect(tabris.XMLHttpRequest).to.be.a('function');
    expect(tabris.XMLHttpRequest.name).to.equal('XMLHttpRequest');
  });

  it('contains widget constructors', function() {
    expect(tabris.Action).to.be.a('function');
    expect(tabris.Action.name).to.equal('Action');
    expect(tabris.ActivityIndicator).to.be.a('function');
    expect(tabris.ActivityIndicator.name).to.equal('ActivityIndicator');
    expect(tabris.Button).to.be.a('function');
    expect(tabris.Button.name).to.equal('Button');
    expect(tabris.CheckBox).to.be.a('function');
    expect(tabris.CheckBox.name).to.equal('CheckBox');
    expect(tabris.Canvas).to.be.a('function');
    expect(tabris.Canvas.name).to.equal('Canvas');
    expect(tabris.CollectionView).to.be.a('function');
    expect(tabris.CollectionView.name).to.equal('CollectionView');
    expect(tabris.Composite).to.be.a('function');
    expect(tabris.Composite.name).to.equal('Composite');
    expect(tabris.ContentView).to.be.a('function');
    expect(tabris.ContentView.name).to.equal('ContentView');
    expect(tabris.Drawer).to.be.a('function');
    expect(tabris.Drawer.name).to.equal('Drawer');
    expect(tabris.ImageView).to.be.a('function');
    expect(tabris.ImageView.name).to.equal('ImageView');
    expect(tabris.NativeObject).to.be.a('function');
    expect(tabris.NativeObject.name).to.equal('NativeObject');
    expect(tabris.NavigationBar).to.be.a('function');
    expect(tabris.NavigationBar.name).to.equal('NavigationBar');
    expect(tabris.NavigationView).to.be.a('function');
    expect(tabris.NavigationView.name).to.equal('NavigationView');
    expect(tabris.Page).to.be.a('function');
    expect(tabris.Page.name).to.equal('Page');
    expect(tabris.Picker).to.be.a('function');
    expect(tabris.Picker.name).to.equal('Picker');
    expect(tabris.ProgressBar).to.be.a('function');
    expect(tabris.ProgressBar.name).to.equal('ProgressBar');
    expect(tabris.RadioButton).to.be.a('function');
    expect(tabris.RadioButton.name).to.equal('RadioButton');
    expect(tabris.ScrollView).to.be.a('function');
    expect(tabris.ScrollView.name).to.equal('ScrollView');
    expect(tabris.SearchAction).to.be.a('function');
    expect(tabris.SearchAction.name).to.equal('SearchAction');
    expect(tabris.Slider).to.be.a('function');
    expect(tabris.Slider.name).to.equal('Slider');
    expect(tabris.Switch).to.be.a('function');
    expect(tabris.Switch.name).to.equal('Switch');
    expect(tabris.StatusBar).to.be.a('function');
    expect(tabris.StatusBar.name).to.equal('StatusBar');
    expect(tabris.Tab).to.be.a('function');
    expect(tabris.Tab.name).to.equal('Tab');
    expect(tabris.TabFolder).to.be.a('function');
    expect(tabris.TabFolder.name).to.equal('TabFolder');
    expect(tabris.TextInput).to.be.a('function');
    expect(tabris.TextInput.name).to.equal('TextInput');
    expect(tabris.TextView).to.be.a('function');
    expect(tabris.TextView.name).to.equal('TextView');
    expect(tabris.ToggleButton).to.be.a('function');
    expect(tabris.ToggleButton.name).to.equal('ToggleButton');
    expect(tabris.Video).to.be.a('function');
    expect(tabris.Video.name).to.equal('Video');
    expect(tabris.WebView).to.be.a('function');
    expect(tabris.WebView.name).to.equal('WebView');
  });

  it('contains other constructors', function() {
    expect(tabris.App).to.be.a('function');
    expect(tabris.Ui).to.be.a('function');
    expect(tabris.Device).to.be.a('function');
    expect(tabris.Widget).to.be.a('function');
    expect(tabris.WidgetCollection).to.be.a('function');
  });

  it('contains event methods', function() {
    expect(tabris.on).to.be.a('function');
    expect(tabris.off).to.be.a('function');
    expect(tabris.once).to.be.a('function');
    expect(tabris.trigger).to.be.a('function');
  });

  describe('when started', function() {

    before(function() {
      tabris._init({
        create: () => {},
        get: () => {},
        set: () => {},
        call: () => {}
      });
    });

    it('creates a crypto object on window and tabris', function() {
      expect(tabris.crypto).to.be.instanceOf(tabris.Crypto);
      expect(window.crypto).to.equal(tabris.crypto);
    });

    it('creates a pkcs5 object on tabris', function() {
      expect(tabris.pkcs5).to.be.an('object');
      expect(tabris.pkcs5.pbkdf2).to.be.a('function');
    });

    it('creates a localStorage object on window and tabris', function() {
      expect(tabris.localStorage).to.be.instanceOf(tabris.Storage);
      expect(window.localStorage).to.equal(tabris.localStorage);
    });

    it('creates service objects on tabris', function() {
      expect(tabris.ui).to.be.instanceOf(tabris.Ui);
      expect(tabris.app).to.be.instanceOf(tabris.App);
      expect(tabris.device).to.be.instanceOf(tabris.Device);
      expect(tabris.fs).to.be.instanceOf(tabris.FileSystem);
    });

    it('creates DOM API singletons', function() {
      expect(window.document).to.be.ok;
      expect(window.location).to.be.ok;
      expect(window.navigator).to.be.ok;
    });

  });

});

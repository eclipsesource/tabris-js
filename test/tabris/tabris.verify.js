global.self = global;
let tabris = require('../../build/tabris/');
let expect = require('chai').expect;

let window = global.window;

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
    expect(window.ImageData).to.be.a('function');
    expect(window.ProgressEvent).to.be.a('function');
    expect(window.Storage).to.be.a('function');
    expect(window.XMLHttpRequest).to.be.a('function');
  });

});

describe('tabris', function() {

  it('contains version', function() {
    expect(tabris.version).to.match(/\d+\.\d+\.\d+/);
  });

  it('contains load function', function() {
    expect(tabris.load).to.be.a('function');
  });

  it('contains DOM API constructors', function() {
    expect(tabris.Crypto).to.be.a('function');
    expect(tabris.ImageData).to.be.a('function');
    expect(tabris.ProgressEvent).to.be.a('function');
    expect(tabris.Storage).to.be.a('function');
    expect(tabris.XMLHttpRequest).to.be.a('function');
  });

  it('contains widget constructors', function() {
    expect(tabris.Action).to.be.a('function');
    expect(tabris.ActivityIndicator).to.be.a('function');
    expect(tabris.Button).to.be.a('function');
    expect(tabris.Cell).to.be.a('function');
    expect(tabris.CheckBox).to.be.a('function');
    expect(tabris.Canvas).to.be.a('function');
    expect(tabris.CollectionView).to.be.a('function');
    expect(tabris.Composite).to.be.a('function');
    expect(tabris.Drawer).to.be.a('function');
    expect(tabris.ImageView).to.be.a('function');
    expect(tabris.Page).to.be.a('function');
    expect(tabris.PageSelector).to.be.a('function');
    expect(tabris.Picker).to.be.a('function');
    expect(tabris.ProgressBar).to.be.a('function');
    expect(tabris.RadioButton).to.be.a('function');
    expect(tabris.ScrollView).to.be.a('function');
    expect(tabris.SearchAction).to.be.a('function');
    expect(tabris.Slider).to.be.a('function');
    expect(tabris.Switch).to.be.a('function');
    expect(tabris.Tab).to.be.a('function');
    expect(tabris.TabFolder).to.be.a('function');
    expect(tabris.TextInput).to.be.a('function');
    expect(tabris.TextView).to.be.a('function');
    expect(tabris.ToggleButton).to.be.a('function');
    expect(tabris.Video).to.be.a('function');
    expect(tabris.WebView).to.be.a('function');
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

    it('creates a localStorage object on window and tabris', function() {
      expect(tabris.localStorage).to.be.instanceOf(tabris.Storage);
      expect(window.localStorage).to.equal(tabris.localStorage);
    });

    it('creates service objects on tabris', function() {
      expect(tabris.ui).to.be.instanceOf(tabris.Ui);
      expect(tabris.app).to.be.instanceOf(tabris.App);
      expect(tabris.device).to.be.instanceOf(tabris.Device);
    });

    it('creates DOM API singletons', function() {
      expect(window.document).to.be.ok;
      expect(window.location).to.be.ok;
      expect(window.navigator).to.be.ok;
    });

  });

});

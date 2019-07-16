global.self = global;
const {expect} = require('chai');
const {copySync, removeSync} = require('fs-extra');
const tabris = require('../../build/tabris');
const ClientMock = require('../../build/tabris/ClientMock').default;

const window = global.window;

describe('global object', function() {

  it('contains Promise', function() {
    expect(global.Promise).to.be.a('function');
    expect(global.Promise.name).to.equal('Promise');
  });

  it('contains fetch', function() {
    expect(global.fetch).to.be.a('function');
  });

  it('contains $', function() {
    expect(global.$).to.equal(tabris.$);
  });

  it('contains JSX', function() {
    expect(global.JSX).to.equal(tabris.JSX);
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
    expect(window.Blob).to.be.a('function');
    expect(window.Blob.name).to.equal('Blob');
    expect(window.Crypto).to.be.a('function');
    expect(window.Crypto.name).to.equal('Crypto');
    expect(window.File).to.be.a('function');
    expect(window.File.name).to.equal('File');
    expect(window.ImageBitmap).to.be.a('function');
    expect(window.ImageBitmap.name).to.equal('ImageBitmap');
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

  it('contains createImageBitmap', function() {
    expect(window.createImageBitmap).to.equal(window.ImageBitmap.createImageBitmap);
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
    expect(tabris.Blob).to.be.a('function');
    expect(tabris.Blob.name).to.equal('Blob');
    expect(tabris.Crypto).to.be.a('function');
    expect(tabris.Crypto.name).to.equal('Crypto');
    expect(tabris.File).to.be.a('function');
    expect(tabris.File.name).to.equal('File');
    expect(tabris.Event).to.be.a('function');
    expect(tabris.Event.name).to.equal('Event');
    expect(tabris.ImageBitmap).to.be.a('function');
    expect(tabris.ImageBitmap.name).to.equal('ImageBitmap');
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
    expect(tabris.ActionSheet).to.be.a('function');
    expect(tabris.ActionSheet.name).to.equal('ActionSheet');
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
    expect(tabris.Stack).to.be.a('function');
    expect(tabris.Composite.name).to.equal('Composite');
    expect(tabris.ContentView).to.be.a('function');
    expect(tabris.ContentView.name).to.equal('ContentView');
    expect(tabris.DateDialog).to.be.a('function');
    expect(tabris.DateDialog.name).to.equal('DateDialog');
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
    expect(tabris.RefreshComposite.name).to.equal('RefreshComposite');
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
    expect(tabris.TimeDialog).to.be.a('function');
    expect(tabris.TimeDialog.name).to.equal('TimeDialog');
    expect(tabris.ToggleButton).to.be.a('function');
    expect(tabris.ToggleButton.name).to.equal('ToggleButton');
    expect(tabris.Video).to.be.a('function');
    expect(tabris.Video.name).to.equal('Video');
    expect(tabris.WebView).to.be.a('function');
    expect(tabris.WebView.name).to.equal('WebView');
  });

  it('contains other constructors', function() {
    expect(tabris.App).to.be.a('function');
    expect(tabris.Device).to.be.a('function');
    expect(tabris.Widget).to.be.a('function');
    expect(tabris.Constraint).to.be.a('function');
    expect(tabris.Font).to.be.a('function');
    expect(tabris.Color).to.be.a('function');
    expect(tabris.LayoutData).to.be.a('function');
    expect(tabris.Image).to.be.a('function');
    expect(tabris.Layout).to.be.a('function');
    expect(tabris.StackLayout).to.be.a('function');
    expect(tabris.WidgetCollection).to.be.a('function');
    expect(tabris.$).to.be.a('function');
    expect(tabris.Percent).to.be.a('function');
    expect(tabris.LinearGradient).to.be.a('function');
    expect(tabris.Listeners).to.be.a('function');
    expect(tabris.ChangeListeners).to.be.a('function');
  });

  it('contains event methods', function() {
    expect(tabris.on).to.be.a('function');
    expect(tabris.off).to.be.a('function');
    expect(tabris.once).to.be.a('function');
    expect(tabris.trigger).to.be.a('function');
  });

  describe('when started', function() {

    before(function() {
      tabris._init(new ClientMock());
    });

    it('creates a crypto object on window and tabris', function() {
      expect(tabris.crypto).to.be.instanceOf(tabris.Crypto);
      expect(window.crypto).to.equal(tabris.crypto);
    });

    it('creates a pkcs5 object on tabris', function() {
      // TODO: revert to `to.be.an('object')` when https://github.com/chaijs/type-detect/issues/98 is fixed
      expect(typeof tabris.pkcs5).to.equal('object');
      expect(tabris.pkcs5.pbkdf2).to.be.a('function');
    });

    it('creates a localStorage object on window and tabris', function() {
      expect(tabris.localStorage).to.be.instanceOf(tabris.Storage);
      expect(window.localStorage).to.equal(tabris.localStorage);
    });

    it('creates service objects on tabris', function() {
      expect(tabris.contentView).to.be.instanceOf(tabris.ContentView);
      expect(tabris.app).to.be.instanceOf(tabris.App);
      expect(tabris.device).to.be.instanceOf(tabris.Device);
      expect(tabris.fs).to.be.instanceOf(tabris.FileSystem);
    });

    it('creates DOM API singletons', function() {
      expect(window.document).to.be.ok;
      expect(window.location).to.be.ok;
      expect(window.navigator).to.be.ok;
    });

    it('sets up JSX processor', function() {
      const composite = JSX.createElement(
        tabris.Composite,
        {padding: 10},
        new tabris.TextView(),
        new tabris.TextView()
      );

      expect(composite).to.be.instanceof(tabris.Composite);
      expect(composite.padding.top).to.equal(10);
      expect(composite.children().length).to.equal(2);
    });

    it('replaces proxified singletons', function() {
      const {device, contentView, drawer, app, fs, navigationBar, statusBar, printer} = tabris;
      contentView.data.foo = 1;
      drawer.data.foo = 1;
      expect(device.model).to.equal(undefined);
      expect(app.version).to.equal(undefined);
      expect(fs.filesDir).to.equal(undefined);
      expect(contentView.bounds).to.deep.equal({left: 0, top: 0, width: 0, height: 0});
      expect(drawer.bounds).to.deep.equal({left: 0, top: 0, width: 0, height: 0});
      expect(contentView.data).to.deep.equal({foo: 1});
      expect(drawer.data).to.deep.equal({foo: 1});

      tabris._init(new ClientMock({
        'tabris.Device': {model: 'foo'},
        'tabris.App': {version: 'bar'},
        'tabris.FileSystem': {filesDir: 'baz'},
        'tabris.Composite': {bounds: [1, 2, 3, 4]},
        'tabris.Drawer': {bounds: [5, 6, 7, 8]}
      }));

      expect(device).to.equal(tabris.device);
      expect(app).to.equal(tabris.app);
      expect(fs).to.equal(tabris.fs);
      expect(navigationBar).to.equal(tabris.navigationBar);
      expect(statusBar).to.equal(tabris.statusBar);
      expect(printer).to.equal(tabris.printer);
      expect(device.model).to.equal('foo');
      expect(app.version).to.equal('bar');
      expect(fs.filesDir).to.equal('baz');
      expect(contentView.bounds).to.deep.equal({left: 1, top: 2, width: 3, height: 4});
      expect(drawer.bounds).to.deep.equal({left: 5, top: 6, width: 7, height: 8});
      expect(contentView.data).to.deep.equal({});
      expect(drawer.data).to.deep.equal({});
    });

  });

});

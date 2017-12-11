import {expect, match, mockTabris, restore, spy, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientStub from './ClientStub';
import App, {create} from '../../src/tabris/App';

describe('App', function() {

  let app, client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    app = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new App({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', function() {
    expect(app).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof App', function() {
    expect(app.constructor.name).to.equal('App');
    expect(app).to.be.an.instanceOf(App);
  });

  describe('create', function() {

    it('creates a native object', function() {
      expect(client.calls({op: 'create', type: 'tabris.App'})).to.not.be.empty;
    });

  });

  describe('properties', function() {

    describe('pinnedCertificates', function() {

      beforeEach(function() {
        tabris.device = {platform: 'Android'};
      });

      it('throws exception when set without "host" property', function() {
        expect(() => {
          app.pinnedCertificates = [{hash: 'sha256/abc'}];
        }).to.throw(Error, /Invalid host/);
      });

      it('throws exception when set without "hash" property', function() {
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com'}];
        }).to.throw(Error, /Invalid hash/);
      });

      it('throws exception when set with invalid "hash" property', function() {
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'foo/bar'}];
        }).to.throw(Error, /Invalid hash/);
      });

      it('throws exception when set without "algorithm" property on iOS', function() {
        tabris.device.platform = 'iOS';
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc'}];
        }).to.throw(Error, /Missing algorithm/);
      });

      it('throws exception when set with invalid "algorithm" property on iOS', function() {
        tabris.device.platform = 'iOS';
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'Foo'}];
        }).to.throw(Error, /Invalid algorithm/);
      });

      it('sets pinned certificates on native side', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc'}];

        let setCall = client.calls({op: 'set', id: app.cid})[0];
        expect(setCall.properties).to.deep.equal({
          pinnedCertificates: [{host: 'example.com', hash: 'sha256/abc'}]
        });
      });

      it('sets pinned certificates, containing "algorithm" property, on iOS', function() {
        tabris.device.platform = 'iOS';
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        let setCall = client.calls({op: 'set', id: app.cid})[0];
        expect(setCall.properties).to.deep.equal({
          pinnedCertificates: [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}]
        });
      });

      it('returns pinnedCertificates', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        expect(app.pinnedCertificates).to.deep.equal([{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}]);
      });

      it('adds native listener on certificatesReceived', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        let listenCall = client.calls({op: 'listen', id: app.cid})[0];
        expect(listenCall.event).to.equal('certificatesReceived');
        expect(listenCall.listen).to.be.true;
      });

      it('cancels certificateReceived event with invalid certificate', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        let cancelled = app._trigger('certificatesReceived', {
          host: 'example.com',
          hashes: ['sha256/uvw', 'sha256/xyz']
        });

        expect(cancelled).to.be.true;
      });

      it('does not cancel certificateReceived event with valid certificate', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        let cancelled = app._trigger('certificatesReceived', {
          host: 'example.com',
          hashes: ['sha256/xyz', 'sha256/abc']
        });

        expect(cancelled).to.be.false;
      });

      it('does not cancel certificateReceived event with unpinned host', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        let cancelled = app._trigger('certificatesReceived', {host: 'somewhere-else.com', hashes: ['sha256/xyz']});

        expect(cancelled).to.be.false;
      });

    });

  });

  it('listens for pause event', function() {
    let listener = spy();

    app.on('pause', listener);

    let calls = client.calls({id: app.cid, op: 'listen', event: 'pause'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers pause event', function() {
    let listener = spy();
    app.on('pause', listener);

    tabris._notify(app.cid, 'pause');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for resume event', function() {
    let listener = spy();

    app.on('resume', listener);

    let calls = client.calls({id: app.cid, op: 'listen', event: 'resume'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers resume event', function() {
    let listener = spy();
    app.on('resume', listener);

    tabris._notify(app.cid, 'resume');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for foreground event', function() {
    let listener = spy();

    app.on('foreground', listener);

    let calls = client.calls({id: app.cid, op: 'listen', event: 'foreground'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers foreground event', function() {
    let listener = spy();
    app.on('foreground', listener);

    tabris._notify(app.cid, 'foreground');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for background event', function() {
    let listener = spy();

    app.on('background', listener);

    let calls = client.calls({id: app.cid, op: 'listen', event: 'background'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers background event', function() {
    let listener = spy();
    app.on('background', listener);

    tabris._notify(app.cid, 'background');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('can not be disposed', function() {
    expect(() => {
      app.dispose();
    }).to.throw();
  });

  it('listens for backNavigation event', function() {
    app.on('backNavigation', spy());

    let calls = client.calls({id: app.cid, op: 'listen', event: 'backNavigation'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers backNavigation event', function() {
    let listener = spy();
    app.on('backNavigation', listener);

    tabris._notify(app.cid, 'backNavigation');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('backNavigation event returns false by default', function() {
    app.on('backNavigation', spy());

    let returnValue = tabris._notify(app.cid, 'backNavigation');

    expect(returnValue).to.equal(false);
  });

  it('backNavigation event returns true if preventDefault is called', function() {
    app.on('backNavigation', function(event) {
      event.preventDefault();
    });

    let returnValue = tabris._notify(app.cid, 'backNavigation');

    expect(returnValue).to.equal(true);
  });

  describe('launch', function() {

    it('rejects if parameter missing', function() {
      return app.launch().then(expectFail, error => {
        expect(error.message).to.equal('Not enough arguments to launch');
      });
    });

    it('rejects invalid url type`', function() {
      return app.launch(23).then(expectFail, error => {
        expect(error.message).to.equal('url is not a string');
      });
    });

    it('calls native `launch`', function() {
      spy(client, 'call');

      app.launch('tel:123-45-67');

      expect(client.call).to.have.been.calledWithMatch(app.cid, 'launch', {url: 'tel:123-45-67'});
    });

    it('resolves on success', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
      return app.launch('tel:123-45-67').then(result => {
        expect(result).to.be.undefined;
      });
    });

    it('rejects in case of error', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onError('Bang'));
      return app.launch('tel:123-45-67').then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Bang');
      });
    });

  });

  describe('registerFont', () => {

    it('rejects if parameter missing', () => {
      expect(() => app.registerFont('Arial')).to.throw(Error, 'Not enough arguments to register a font');
    });

    it('rejects invalid alias type', () => {
      expect(() => app.registerFont(23, 'arial.ttf')).to.throw(Error, 'alias is not a string');
    });

    it('rejects invalid font type', () => {
      expect(() => app.registerFont('Arial', 23)).to.throw(Error, 'file is not a string');
    });

    it('calls native `registerFont`', () => {
      spy(client, 'call');

      app.registerFont('Arial', 'arial.ttf');

      expect(client.call).to.have.been.calledWithMatch(app.cid, 'registerFont', {alias: 'Arial', file: 'arial.ttf'});
    });

  });

  describe('reload', function() {

    it('CALLs `reload`', function() {
      spy(client, 'call');

      app.reload();

      expect(client.call).to.have.been.calledWith(app.cid, 'reload', {});
    });

  });

  describe('getResourceLocation', function() {

    beforeEach(function() {
      let origGet = client.get;
      stub(client, 'get').callsFake(() => {
        origGet.apply(client, arguments);
        return '/root';
      });
    });

    it("GETs 'resourceBaseUrl'", function() {
      app.getResourceLocation();

      expect(client.get).to.have.been.calledWith(app.cid, 'resourceBaseUrl');
    });

    it("GETs 'resourceBaseUrl' only once", function() {
      app.getResourceLocation();
      app.getResourceLocation();

      expect(client.get).to.have.been.calledOnce;
    });

    it('appends normalized parameter', function() {
      let result = app.getResourceLocation('foo//bar');

      expect(result).to.equal('/root/foo/bar');
    });

    it('strips leading and trailing slash', function() {
      let result = app.getResourceLocation('/foo/bar/');

      expect(result).to.equal('/root/foo/bar');
    });

    it("ignores '.' segments", function() {
      let result = app.getResourceLocation('./foo/bar');

      expect(result).to.equal('/root/foo/bar');
    });

    it("throws on '..'", function() {
      expect(() => {
        app.getResourceLocation('../foo');
      }).to.throw("Path must not contain '..'");
    });

  });

  describe('installPatch', function() {

    let callback, error;

    beforeEach(function() {
      callback = spy();
      error = {};
    });

    it('fails if parameter is not a string', function() {
      expect(() => {
        app.installPatch(23);
      }).to.throw();
    });

    it('CALLs `installPatch` with URL', function() {
      spy(client, 'call');

      app.installPatch('http://example.com/patch');

      expect(client.call).to.have.been.calledWith(app.cid, 'installPatch', {
        url: 'http://example.com/patch'
      });
    });

    it('does not CALL `installPatch` when already pending', function() {
      app.installPatch('http://example.com/patch1');
      spy(client, 'call');

      app.installPatch('http://example.com/patch2');

      expect(client.call).to.have.not.been.called;
    });

    it('errors if install already pending', function() {
      app.installPatch('http://example.com/patch');

      app.installPatch('http://example.com/patch', callback);

      expect(callback).to.have.been.calledWith(match(Error));
      expect(callback).to.have.been.calledWith(match({message: match(/already pending/)}));
    });

    it('starts LISTEN on `patchInstall` event', function() {
      spy(client, 'listen');

      app.installPatch('http://example.com/patch');

      expect(client.listen).to.have.been.calledWith(app.cid, 'patchInstall', true);
    });

    describe('on success event with illegal JSON', function() {

      beforeEach(function() {
        app.installPatch('http://example.com/patch', callback);
        spy(tabris._nativeBridge, 'listen');
        spy(tabris._nativeBridge, 'call');

        tabris._notify(app.cid, 'patchInstall', {success: '{not json}'});
      });

      it('notifies callback with error', function() {
        expect(callback).to.have.been.calledWith(match(Error));
        expect(callback).to.have.been.calledWith(match({message: match(/parse/)}));
      });

      it('stops LISTEN on `patchInstall` event', function() {
        expect(tabris._nativeBridge.listen).to.have.been.calledWith(app.cid, 'patchInstall', false);
      });

      it('allows for subsequent calls', function() {
        app.installPatch('http://example.com/patch');

        expect(tabris._nativeBridge.call).to.have.been.called;
      });

    });

    describe('on success event', function() {

      beforeEach(function() {
        app.installPatch('http://example.com/patch', callback);
        spy(tabris._nativeBridge, 'listen');
        spy(tabris._nativeBridge, 'call');

        tabris._notify(app.cid, 'patchInstall', {success: '{"version": 23}'});
      });

      it('notifies callback', function() {
        expect(callback).to.have.been.calledWith(null, {version: 23});
      });

      it('stops LISTEN on `patchInstall` event', function() {
        expect(tabris._nativeBridge.listen).to.have.been.calledWith(app.cid, 'patchInstall', false);
      });

      it('allows for subsequent calls', function() {
        app.installPatch('http://example.com/patch');

        expect(tabris._nativeBridge.call).to.have.been.called;
      });

    });

    describe('on error event', function() {

      beforeEach(function() {
        app.installPatch('http://example.com/patch', callback);
        spy(tabris._nativeBridge, 'listen');
        spy(tabris._nativeBridge, 'call');

        tabris._notify(app.cid, 'patchInstall', {error});
      });

      it('notifies callback', function() {
        expect(callback).to.have.been.calledWithMatch({message: error});
      });

      it('stops LISTEN on `patchInstall` event', function() {
        expect(tabris._nativeBridge.listen).to.have.been.calledWith(app.cid, 'patchInstall', false);
      });

      it('allows for subsequent calls', function() {
        app.installPatch('http://example.com/patch');

        expect(tabris._nativeBridge.call).to.have.been.called;
      });

    });

  });

  describe('properties', function() {

    describe('id', function() {

      it('should return `appId` from native', function() {
        stub(client, 'get').returns('foo');

        let result = app.id;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'appId');
      });

      it('should not SET native property', function() {
        app.id = 'newId';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('version', function() {

      it('should return `version` from native', function() {
        stub(client, 'get').returns('foo');

        let result = app.version;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'version');
      });

      it('should not SET native property', function() {
        app.version = '1.2.3';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('versionCode', function() {

      it('should return `versionId` from native', function() {
        stub(client, 'get').returns('foo');

        let result = app.versionCode;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'versionId');
      });

      it('should not SET native property', function() {
        app.versionCode = 123;

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

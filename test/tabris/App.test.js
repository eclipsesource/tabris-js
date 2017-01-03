import {expect, spy, stub, restore, match} from '../test';
import ProxyStore from '../../src/tabris/ProxyStore';
import NativeBridge from '../../src/tabris/NativeBridge';
import NativeObject from '../../src/tabris/NativeObject';
import ClientStub from './ClientStub';
import App, {create} from '../../src/tabris/App';

describe('App', function() {

  let app, client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {
      },
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
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
    expect(app).to.be.an.instanceOf(App);
  });

  describe('properties', function() {

    describe('pinnedCertificates', function() {

      beforeEach(function() {
        tabris.device = {platform: 'Android'};
      });

      it('throws exception when set without "domain" property', function() {
        expect(() => {
          app.pinnedCertificates = [{hash: 'sha256/abc'}];
        }).to.throw();
      });

      it('throws exception when set without "hash" property', function() {
        expect(() => {
          app.pinnedCertificates = [{domain: 'example.com'}];
        }).to.throw();
      });

      it('throws exception when set without "algorithm" property on iOS', function() {
        tabris.device.platform = 'iOS';
        expect(() => {
          app.pinnedCertificates = [{domain: 'example.com', hash: 'sha256/abc'}];
        }).to.throw();
      });


      it('sets pinned certificates on native side', function() {
        app.pinnedCertificates = [{domain: 'example.com', hash: 'sha256/abc'}];

        let pinnedCertificates = [{domain: 'example.com', hash: 'sha256/abc'}];

        expect(client.calls({op: 'set', id: app.cid})[0].properties).to.eql({pinnedCertificates});
      });

      it('sets pinned certificates, containing "algorithm" property, on iOS', function() {
        tabris.device.platform = 'iOS';

        app.pinnedCertificates = [{domain: 'example.com', hash: 'sha256/abc', algorithm: 'alg1'}];

        let pinnedCertificates = [{domain: 'example.com', hash: 'sha256/abc', algorithm: 'alg1'}];
        expect(client.calls({op: 'set', id: app.cid})[0].properties).to.eql({pinnedCertificates});
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

    expect(listener).to.have.been.called;
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

    expect(listener).to.have.been.called;
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

    expect(listener).to.have.been.called;
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

    expect(listener).to.have.been.called;
  });

  it('can not be disposed', function() {
    expect(() => {
      app.dispose();
    }).to.throw();
  });

  it('listens for backnavigation event', function() {
    app.on('backnavigation', spy());

    let calls = client.calls({id: app.cid, op: 'listen', event: 'backnavigation'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers backnavigation event', function() {
    let listener = spy();
    app.on('backnavigation', listener);

    tabris._notify(app.cid, 'backnavigation');

    expect(listener).to.have.been.calledWith(app, match.object);
  });

  it('backnavigation event returns false by default', function() {
    app.on('backnavigation', spy());

    let returnValue = tabris._notify(app.cid, 'backnavigation');

    expect(returnValue).to.equal(false);
  });

  it('backnavigation event returns true if preventDefault is called', function() {
    app.on('backnavigation', function(app, event) {
      event.preventDefault = true;
    });

    let returnValue = tabris._notify(app.cid, 'backnavigation');

    expect(returnValue).to.equal(true);
  });

  it('backnavigation event returns true if preventDefault is set to true', function() {
    app.on('backnavigation', function(app, event) {
      event.preventDefault();
    });

    let returnValue = tabris._notify(app.cid, 'backnavigation');

    expect(returnValue).to.equal(true);
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
      stub(client, 'get', function() {
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
        expect(callback).to.have.been.calledWith(new Error(error));
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

      it('should GET "appId" from native', function() {
        app.id;

        expect(client.calls({op: 'get', id: app.cid, property: 'appId'}).length).to.equal(1);
      });

      it('should not SET native property', function() {
        app.id = 'newId';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('version', function() {

      it('should GET "version" from native', function() {
        app.version;

        expect(client.calls({op: 'get', id: app.cid, property: 'version'}).length).to.equal(1);
      });

      it('should not SET native property', function() {
        app.version = '1.2.3';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('versionCode', function() {

      it('should get "versionId" from native', function() {
        app.versionCode;

        expect(client.calls({op: 'get', id: app.cid, property: 'versionId'}).length).to.equal(1);
      });

      it('should not SET native property', function() {
        app.versionCode = 123;

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });
    });

  });

});

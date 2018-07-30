import {expect, mockTabris, spy, stub} from '../test';
import ClientStub from './ClientStub';
import Device, {create as createDevice, publishDeviceProperties} from '../../src/tabris/Device';

describe('Device', function() {

  let device, client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  it('cannot be instantiated', function() {
    expect(() => new Device()).to.throw(Error, 'Device can not be created');
  });

  describe('create', function() {

    it('creates a native object', function() {
      createDevice();
      expect(client.calls({op: 'create', type: 'tabris.Device'})).to.not.be.empty;
    });

  });

  describe('instance', function() {

    let results;

    beforeEach(function() {
      results = {
        model: 'x1',
        vendor: 'xyz',
        platform: 'foo',
        version: '23',
        name: 'xyz',
        language: 'es',
        screenWidth: 23,
        screenHeight: 42,
        scaleFactor: 2.5,
        orientation: 'portrait',
      };
      stub(client, 'get').callsFake((id, name) => {
        if (id === device.cid) {
          return results[name];
        }
      });
      spy(client, 'set');
      device = createDevice();
    });
    it('provides properties', function() {
      expect(device.model).to.equal('x1');
      expect(device.vendor).to.equal('xyz');
      expect(device.platform).to.equal('foo');
      expect(device.version).to.equal('23');
      expect(device.name).to.equal('xyz');
      expect(device.language).to.equal('es');
      expect(device.screenWidth).to.equal(23);
      expect(device.screenHeight).to.equal(42);
      expect(device.scaleFactor).to.equal(2.5);
      expect(device.orientation).to.equal('portrait');
    });

    it('caches static properties', function() {
      device.model;
      device.vendor;
      device.platform;
      device.version;
      device.scaleFactor;

      results = {};

      expect(device.model).to.equal('x1');
      expect(device.vendor).to.equal('xyz');
      expect(device.platform).to.equal('foo');
      expect(device.version).to.equal('23');
      expect(device.scaleFactor).to.equal(2.5);
    });

    it('setting properties does not call native SET', function() {
      stub(console, 'warn');
      device.model = 'x1';
      device.vendor = 'xyz';
      device.platform = 'foo';
      device.version = '23';
      device.name = 'xyz';
      device.language = 'es';
      device.screenWidth = 23;
      device.screenHeight = 42;
      device.orientation = 'portrait';

      expect(client.set).not.to.have.been.called;
    });

    it('prevents overwriting properties', function() {
      device.language = 'fr';

      expect(device.language).to.equal('es');
    });

    it('adds listener for orientationChanged event', function() {
      device.onOrientationChanged(function() {});

      let calls = client.calls({id: device.cid, op: 'listen', event: 'orientationChanged'});
      expect(calls[0].listen).to.equal(true);
    });

    it('triggers orientationChanged event', function() {
      let listener = spy();
      device.onOrientationChanged(listener);

      tabris._notify(device.cid, 'orientationChanged', {orientation: 'portrait'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: device, value: 'portrait'});
    });

    it('can not be disposed', function() {
      expect(() => {
        device.dispose();
      }).to.throw(Error, 'Cannot dispose device object');
    });

    it('has no listener registration functions for static properties', function() {
      expect(device.onPlatformChanged).to.be.undefined;
      expect(device.onVersionChanged).to.be.undefined;
      expect(device.onModelChanged).to.be.undefined;
      expect(device.onVendorChanged).to.be.undefined;
      expect(device.onNameChanged).to.be.undefined;
      expect(device.onLanguageChanged).to.be.undefined;
      expect(device.onScreenWidthChanged).to.be.undefined;
      expect(device.onScreenHeightChanged).to.be.undefined;
      expect(device.onScaleFactorChanged).to.be.undefined;
    });

  });

  describe('create', function() {

    it('creates an instance', function() {
      expect(createDevice()).to.be.instanceOf(Device);
    });

  });

  describe('publishDeviceProperties', function() {

    let target, device;

    beforeEach(function() {
      device = {
        scaleFactor: 23
      };
      target = {};
      mockTabris(client);
      stub(client, 'get').callsFake((id, name) => {
        if (id === 'tabris.Device') {
          return device[name];
        }
      });
      publishDeviceProperties(device, target);
    });

    it('creates device', function() {
      expect(target.device).to.be.ok;
    });

    it('allows overwriting device', function() {
      // See #785
      target.device = 42;
      expect(target.device).to.equal(42);
    });

    it('provides device.model', function() {
      device.model = 'x1';
      expect(target.device.model).to.equal('x1');
    });

    it('prevents overwriting device.model', function() {
      device.model = 'x1';
      target.device.model = 'x2';
      expect(target.device.model).to.equal('x1');
    });

    it('provides device.vendor', function() {
      device.vendor = 'xyz';
      expect(target.device.vendor).to.equal('xyz');
    });

    it('prevents overwriting device.vendor', function() {
      device.vendor = 'xyz1';
      target.device.vendor = 'xyz2';
      expect(target.device.vendor).to.equal('xyz1');
    });

    it('provides device.platform', function() {
      device.platform = 'foo';
      expect(target.device.platform).to.equal('foo');
    });

    it('prevents overwriting device.platform', function() {
      device.platform = 'foo';
      target.device.platform = 'bar';
      expect(target.device.platform).to.equal('foo');
    });

    it('provides device.version', function() {
      device.version = '23';
      expect(target.device.version).to.equal('23');
    });

    it('prevents overwriting device.version', function() {
      device.version = '23';
      target.device.version = '42';
      expect(target.device.version).to.equal('23');
    });

    it('provides device.name', function() {
      device.name = 'xyz';
      expect(target.device.name).to.equal('xyz');
    });

    it('prevents overwriting device.name', function() {
      device.name = 'xyz1';
      target.device.name = 'xyz2';
      expect(target.device.name).to.equal('xyz1');
    });

    it('provides devicePixelRatio', function() {
      expect(target.devicePixelRatio).to.equal(23);
    });

    it('allows overwriting devicePixelRatio', function() {
      // Browsers also allow overwriting
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).to.equal(42);
    });

    it('creates navigator', function() {
      expect(target.navigator).to.be.ok;
    });

    it('provides navigator.language', function() {
      device.language = 'es';
      expect(target.navigator.language).to.equal('es');
    });

    it('prevents overwriting navigator.language', function() {
      device.language = 'es';
      target.navigator.language = 'fr';
      expect(target.navigator.language).to.equal('es');
    });

    it('provides navigator.userAgent', function() {
      expect(target.navigator.userAgent).to.equal('tabris-js');
    });

    it('prevents overwriting navigator.userAgent', function() {
      target.navigator.userAgent = 'foo';
      expect(target.navigator.userAgent).to.equal('tabris-js');
    });

    it('creates screen', function() {
      expect(target.screen).to.be.ok;
    });

    it('allows overwriting screen', function() {
      // Browsers also allow overwriting
      target.screen = 23;
      expect(target.screen).to.equal(23);
    });

  });

});

import {expect, spy, stub} from "../test";
import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import ClientStub from "./ClientStub";
import Device, {publishDeviceProperties} from "../../src/tabris/Device";

describe("Device", function() {

  let device, results, client;

  beforeEach(function() {
    results = {};
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    stub(client, "get", function(id, name) {
      if (id === "tabris.Device") {
        return results[name];
      }
    });
    device = new Device();
  });

  it("provides model", function() {
    results.model = "x1";
    expect(device.get("model")).to.equal("x1");
  });

  it("provides platform", function() {
    results.platform = "foo";
    expect(device.get("platform")).to.equal("foo");
  });

  it("provides version", function() {
    results.version = "23";
    expect(device.get("version")).to.equal("23");
  });

  it("provides language", function() {
    results.language = "es";
    expect(device.get("language")).to.equal("es");
  });

  it("provides screenWidth", function() {
    results.screenWidth = 23;
    expect(device.get("screenWidth")).to.equal(23);
  });

  it("provides screenHeight", function() {
    results.screenHeight = 23;
    expect(device.get("screenHeight")).to.equal(23);
  });

  it("provides orientation", function() {
    results.orientation = "portrait";
    expect(device.get("orientation")).to.equal("portrait");
  });

  it("adds listener for orientationchange event", function() {
    device.on("change:orientation", function() {});

    let calls = client.calls({id: "tabris.Device", op: "listen", event: "orientationchange"});
    expect(calls[0].listen).to.equal(true);
  });

  it("triggers change:orientation event", function() {
    let listener = spy();
    device.on("change:orientation", listener);

    tabris._notify("tabris.Device", "orientationchange", {orientation: "portrait"});

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWith(device, "portrait");
  });

  it("prevents overwriting properties", function() {
    results.language = "es";
    device.set("language", "fr");
    expect(device.get("language")).to.equal("es");
  });

  it("can not be disposed", function() {
    expect(() => {
      device.dispose();
    }).to.throw();
  });

});

describe("publishDeviceProperties", function() {

  let target, results, nativeBridge;

  beforeEach(function() {
    results = {};
    nativeBridge = new ClientStub();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(nativeBridge);
    global.tabris.device = new Device();
    stub(nativeBridge, "get", function(id, name) {
      if (id === "tabris.Device") {
        return results[name];
      }
    });
  });

  describe("when device exists", function() {

    let orig;

    beforeEach(function() {
      orig = {};
      target = {device: orig};
      publishDeviceProperties(target);
    });

    it("does not modify device", function() {
      expect(target.device).to.equal(orig);
    });

  });

  describe("when device does not exist", function() {

    beforeEach(function() {
      target = {};
      publishDeviceProperties(target);
    });

    it("creates device", function() {
      expect(target.device).to.be.ok;
    });

    it("allows overwriting device", function() {
      // See #785
      target.device = 42;
      expect(target.device).to.equal(42);
    });

    it("provides device.model", function() {
      results.model = "x1";
      expect(target.device.model).to.equal("x1");
    });

    it("prevents overwriting device.model", function() {
      results.model = "x1";
      target.device.model = "x2";
      expect(target.device.model).to.equal("x1");
    });

    it("provides device.platform", function() {
      results.platform = "foo";
      expect(target.device.platform).to.equal("foo");
    });

    it("prevents overwriting device.platform", function() {
      results.platform = "foo";
      target.device.platform = "bar";
      expect(target.device.platform).to.equal("foo");
    });

    it("provides device.version", function() {
      results.version = "23";
      expect(target.device.version).to.equal("23");
    });

    it("prevents overwriting device.version", function() {
      results.version = "23";
      target.device.version = "42";
      expect(target.device.version).to.equal("23");
    });

  });

  describe("when devicePixelRatio exists", function() {

    beforeEach(function() {
      target = {
        devicePixelRatio: 23
      };
      publishDeviceProperties(target);
    });

    it("does not change devicePixelRatio", function() {
      expect(target.devicePixelRatio).to.equal(23);
    });

  });

  describe("when devicePixelRatio does not exist", function() {

    beforeEach(function() {
      target = {};
      results.scaleFactor = 23;
      publishDeviceProperties(target);
    });

    it("provides devicePixelRatio", function() {
      expect(target.devicePixelRatio).to.equal(23);
    });

    it("allows overwriting devicePixelRatio", function() {
      // Browsers also allow overwriting
      target.devicePixelRatio = 42;
      expect(target.devicePixelRatio).to.equal(42);
    });

  });

  describe("when navigator does not exist", function() {

    beforeEach(function() {
      target = {};
      publishDeviceProperties(target);
    });

    it("does not create navigator", function() {
      expect(target.navigator).to.be.undefined;
    });

  });

  describe("when navigator.language exists", function() {

    beforeEach(function() {
      target = {
        navigator: {
          language: "es"
        }
      };
      publishDeviceProperties(target);
    });

    it("does not change navigator.language", function() {
      expect(target.navigator.language).to.equal("es");
    });

  });

  describe("when navigator.language does not exist", function() {

    beforeEach(function() {
      target = {
        navigator: {}
      };
      publishDeviceProperties(target);
    });

    it("provides navigator.language", function() {
      results.language = "es";
      expect(target.navigator.language).to.equal("es");
    });

    it("prevents overwriting navigator.language", function() {
      results.language = "es";
      target.navigator.language = "fr";
      expect(target.navigator.language).to.equal("es");
    });

  });

  describe("when screen exists", function() {

    beforeEach(function() {
      target = {
        screen: {}
      };
      publishDeviceProperties(target);
    });

    it("does not modify screen", function() {
      expect(target.screen).to.eql({});
    });

  });

  describe("when screen does not exist", function() {

    beforeEach(function() {
      target = {};
      publishDeviceProperties(target);
    });

    it("creates screen", function() {
      expect(target.screen).to.be.ok;
    });

    it("allows overwriting screen", function() {
      // Browsers also allow overwriting
      target.screen = 23;
      expect(target.screen).to.equal(23);
    });

  });

});

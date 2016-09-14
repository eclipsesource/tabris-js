import {expect, spy, restore, match} from "../../test";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import ClientStub from "../ClientStub";
import UI from "../../../src/tabris/UI";
import PageSelector from "../../../src/tabris/widgets/PageSelector";
import Page from "../../../src/tabris/widgets/Page";
import Drawer from "../../../src/tabris/widgets/Drawer";
import CollectionView from "../../../src/tabris/widgets/CollectionView";

describe("PageSelector", function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    global.device = {platform: "test"};
    global.tabris._nativeBridge = new NativeBridge(client);
    tabris.ui = new UI();
  });

  afterEach(function() {
    restore();
    delete tabris.ui;
  });

  describe("create", function() {

    let page1, page2, pageSelector;

    beforeEach(function() {
      page1 = new Page({topLevel: true});
      page2 = new Page({topLevel: true});
      pageSelector = new PageSelector();
    });

    it("creates a CollectionView", function() {
      expect(pageSelector).to.be.an.instanceof(CollectionView);
    });

    it("includes default (fill) layoutData", function() {
      expect(pageSelector.get("layoutData")).to.eql({left: 0, right: 0, top: 0, bottom: 0});
    });

    it("allows to override properties", function() {
      let pageSelector = new PageSelector({
        layoutData: {left: 10, top: 20}
      });

      expect(pageSelector.get("layoutData")).to.eql({left: 10, top: 20});
    });

    it("includes all pages as items", function() {
      let pageSelector = new PageSelector();

      expect(pageSelector.get("items")).to.eql([page1, page2]);
    });

    it("adds pages dynamically", function() {
      let page3 = new Page({topLevel: true});

      expect(pageSelector.get("items")).to.eql([page1, page2, page3]);
    });

    it("removes pages dynamically", function() {
      page2.dispose();

      expect(pageSelector.get("items")).to.eql([page1]);
    });

    it("opens page on select", function() {
      spy(page1, "open");
      pageSelector.trigger("select", pageSelector, page1);

      expect(page1.open).to.have.been.called;
    });

    it("closes drawer on select", function() {
      let drawer = new Drawer();
      spy(drawer, "close");
      pageSelector.trigger("select", pageSelector, page1);

      expect(drawer.close).to.have.been.called;
    });

    it("removes tabris.ui event callbacks on dispose", function() {
      spy(tabris.ui, "off");
      pageSelector.dispose();

      expect(tabris.ui.off).to.have.been.calledWith("addchild", match.typeOf("function"));
      expect(tabris.ui.off).to.have.been.calledWith("removechild", match.typeOf("function"));
    });

  });

});

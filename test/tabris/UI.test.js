import {expect, restore} from "../test";
import ProxyStore from "../../src/tabris/ProxyStore";
import NativeBridge from "../../src/tabris/NativeBridge";
import ClientStub from "./ClientStub";
import UI from "../../src/tabris/UI";

describe("UI", function() {

  let client, ui;

  beforeEach(function() {
    client = new ClientStub();
    global.tabris = {
      on: () => {},
      _notify: (cid, event, param) => tabris._proxies.find(cid)._trigger(event, param),
      _proxies: new ProxyStore()
    };
    global.tabris._nativeBridge = new NativeBridge(client);
    ui = new UI();
  });

  afterEach(restore);

  it("creates content Composite ", function() {
    let createCalls = client.calls({op: "create"});
    expect(createCalls[0].type).to.equal("tabris.Composite");
    expect(createCalls[0].properties.root).to.be.true;
  });

  it("exposes content Composite ", function() {
    let createCalls = client.calls({op: "create"});
    expect(ui.content.cid).to.equal(createCalls[0].id);
  });

  it("does not allow overriding ui.content ", function() {
    let content = ui.content;

    delete ui.content;
    ui.content = undefined;

    expect(ui.content).to.equal(content);
  });

});

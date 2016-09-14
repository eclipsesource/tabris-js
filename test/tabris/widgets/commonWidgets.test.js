import {expect, spy, restore} from "../../test";
import ClientStub from "../ClientStub";
import ProxyStore from "../../../src/tabris/ProxyStore";
import NativeBridge from "../../../src/tabris/NativeBridge";
import Composite from "../../../src/tabris/widgets/Composite";
import Canvas from "../../../src/tabris/widgets/Canvas";
import Button from "../../../src/tabris/widgets/Button";
import CheckBox from "../../../src/tabris/widgets/CheckBox";
import ImageView from "../../../src/tabris/widgets/ImageView";
import ProgressBar from "../../../src/tabris/widgets/ProgressBar";
import RadioButton from "../../../src/tabris/widgets/RadioButton";
import Slider from "../../../src/tabris/widgets/Slider";
import TextView from "../../../src/tabris/widgets/TextView";
import TextInput from "../../../src/tabris/widgets/TextInput";
import Switch from "../../../src/tabris/widgets/Switch";
import ToggleButton from "../../../src/tabris/widgets/ToggleButton";
import WebView from "../../../src/tabris/widgets/WebView";
import ActivityIndicator from "../../../src/tabris/widgets/ActivityIndicator";

describe("Common Widgets", function() {

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
    return client.calls({op: "create"})[0];
  }

  function checkEvent(value) {
    expect(listener).to.have.been.calledOnce;
    if (arguments.length > 0) {
      expect(listener).to.have.been.calledWith(widget, value, arguments[1] || {});
    } else {
      expect(listener).to.have.been.calledWith(widget, {});
    }
  }

  function checkListen(event) {
    let listen = client.calls({op: "listen", id: widget.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  it("ActivityIndicator", function() {
    new ActivityIndicator();

    expect(getCreate().type).to.equal("tabris.ActivityIndicator");
  });

  it("Button", function() {
    let button = new Button({enabled: false});

    expect(getCreate().type).to.equal("tabris.Button");
    expect(button.get("image")).to.equal(null);
    expect(button.get("alignment")).to.equal("center");
    expect(button.get("text")).to.equal("");
  });

  it("Button select", function() {
    widget = new Button().on("select", listener);

    tabris._notify(widget.cid, "select", {});

    checkEvent();
    checkListen("select");
  });

  it("Canvas", function() {
    new Canvas();

    expect(getCreate().type).to.eql("tabris.Canvas");
  });

  it("CheckBox", function() {
    let checkBox = new CheckBox({enabled: false});

    expect(getCreate().type).to.eql("tabris.CheckBox");
    expect(checkBox.get("text")).to.equal("");
  });

  it("CheckBox select", function() {
    widget = new CheckBox().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("CheckBox change:selection", function() {
    widget = new CheckBox().on("change:selection", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("Composite", function() {
    new Composite();

    expect(getCreate().type).to.eql("tabris.Composite");
  });

  it("ImageView", function() {
    let imageView = new ImageView();

    expect(getCreate().type).to.eql("tabris.ImageView");
    expect(imageView.get("image")).to.equal(null);
    expect(imageView.get("scaleMode")).to.equal("auto");
  });

  it("ProgressBar", function() {
    let progressBar = new ProgressBar();

    expect(getCreate().type).to.eql("tabris.ProgressBar");
    expect(progressBar.get("minimum")).to.equal(0);
    expect(progressBar.get("maximum")).to.equal(100);
    expect(progressBar.get("selection")).to.equal(0);
    expect(progressBar.get("state")).to.equal("normal");
  });

  it("RadioButton", function() {
    let radioButton = new RadioButton({enabled: false});

    expect(getCreate().type).to.eql("tabris.RadioButton");
    expect(radioButton.get("text")).to.equal("");
  });

  it("RadioButton select", function() {
    widget = new RadioButton().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("RadioButton change:selection", function() {
    widget = new RadioButton().on("change:selection", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("TextView", function() {
    let textView = new TextView({text: "foo"});

    expect(getCreate().type).to.eql("tabris.TextView");
    expect(getCreate().properties).to.eql({text: "foo"});
    expect(textView.get("alignment")).to.equal("left");
    expect(textView.get("markupEnabled")).to.equal(false);
    expect(textView.get("maxLines")).to.equal(null);
  });

  it("TextView, maxLines: 0 is mapped to null", function() {
    new TextView({text: "foo", maxLines: 0});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it("TextView, maxLines: values <= 0 are mapped to null", function() {
    new TextView({text: "foo", maxLines: -1});

    expect(getCreate().properties.maxLines).to.be.null;
  });

  it("Slider", function() {
    let slider = new Slider({selection: 23});

    expect(getCreate().type).to.eql("tabris.Slider");
    expect(getCreate().properties).to.eql({selection: 23});
    expect(slider.get("minimum")).to.equal(0);
    expect(slider.get("maximum")).to.equal(100);
  });

  it("Slider select", function() {
    widget = new Slider().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: 23});
    checkEvent(23);
    checkListen("select");
  });

  it("Slider change:selection", function() {
    widget = new Slider().on("change:selection", listener);
    tabris._notify(widget.cid, "select", {selection: 23});
    checkEvent(23);
    checkListen("select");
  });

  it("TextInput", function() {
    let textInput = new TextInput({text: "foo"});

    expect(getCreate().type).to.eql("tabris.TextInput");
    expect(getCreate().properties).to.eql({text: "foo"});
    expect(textInput.get("message")).to.equal("");
    expect(textInput.get("alignment")).to.equal("left");
    expect(textInput.get("keyboard")).to.equal("default");
    expect(textInput.get("autoCorrect")).to.equal(false);
    expect(textInput.get("autoCapitalize")).to.equal(false);
  });

  it("TextInput input", function() {
    widget = new TextInput().on("input", listener);
    tabris._notify(widget.cid, "input", {text: "foo"});
    checkEvent("foo");
    checkListen("input");
  });

  it("TextInput accept", function() {
    widget = new TextInput().on("accept", listener);
    tabris._notify(widget.cid, "accept", {text: "foo"});
    checkEvent("foo");
    checkListen("accept");
  });

  it("TextInput change:text", function() {
    widget = new TextInput().on("change:text", listener);
    tabris._notify(widget.cid, "input", {text: "foo"});
    checkEvent("foo");
    checkListen("input");
  });

  it("WebView", function() {
    new WebView({html: "foo"});

    expect(getCreate().type).to.eql("tabris.WebView");
    expect(getCreate().properties).to.eql({html: "foo"});
  });

  it("Switch", function() {
    new Switch({selection: true});

    expect(getCreate().type).to.eql("tabris.Switch");
    expect(getCreate().properties).to.eql({selection: true});
  });

  it("Switch change:selection", function() {
    widget = new Switch().on("change:selection", listener);

    tabris._notify(widget.cid, "select", {selection: true});

    checkEvent(true);
    checkListen("select");
  });

  it("Switch change:selection on property change", function() {
    widget = new Switch().on("change:selection", listener);

    widget.set("selection", true);

    checkEvent(true);
  });

  it("Switch select", function() {
    widget = new Switch().on("select", listener);

    tabris._notify(widget.cid, "select", {selection: true});

    checkEvent(true);
    checkListen("select");
  });

  it("ToggleButton", function() {
    let toggleButton = new ToggleButton({enabled: false});

    expect(getCreate().type).to.eql("tabris.ToggleButton");
    expect(toggleButton.get("text")).to.equal("");
    expect(toggleButton.get("image")).to.equal(null);
    expect(toggleButton.get("alignment")).to.equal("center");
  });

  it("ToggleButton change:selection", function() {
    widget = new ToggleButton().on("change:selection", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("ToggleButton select", function() {
    widget = new ToggleButton().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

});

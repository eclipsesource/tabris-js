describe("Common Widgets", function() {

  var nativeBridge;
  var widget;
  var listener;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    listener = jasmine.createSpy();
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  function getCreate() {
    return nativeBridge.calls({op: "create"})[0];
  }

  function checkEvent(value) {
    expect(listener.calls.count()).toBe(1);
    expect(listener.calls.argsFor(0)[0]).toBe(widget);
    if (arguments.length > 0) {
      expect(listener.calls.argsFor(0)[1]).toEqual(value);
      expect(listener.calls.argsFor(0)[2]).toEqual(arguments[1] || {});
    } else {
      expect(listener.calls.argsFor(0)[1]).toEqual({});
    }
  }

  function checkListen(event) {
    var listen = nativeBridge.calls({op: "listen", id: widget.cid});
    expect(listen.length).toBe(1);
    expect(listen[0].event).toBe(event);
    expect(listen[0].listen).toBe(true);
  }

  it("ActivityIndicator", function() {
    new tabris.ActivityIndicator();

    expect(getCreate().type).toEqual("tabris.ActivityIndicator");
  });

  it("Button", function() {
    var button = new tabris.Button({enabled: false});

    expect(getCreate().type).toEqual("tabris.Button");
    expect(button.get("image")).toBe(null);
    expect(button.get("alignment")).toBe("center");
    expect(button.get("text")).toBe("");
  });

  it("Button select", function() {
    widget = new tabris.Button().on("select", listener);

    tabris._notify(widget.cid, "select", {});

    checkEvent();
    checkListen("select");
  });

  it("Canvas", function() {
    new tabris.Canvas();

    expect(getCreate().type).toEqual("tabris.Canvas");
  });

  it("CheckBox", function() {
    var checkBox = new tabris.CheckBox({enabled: false});

    expect(getCreate().type).toEqual("tabris.CheckBox");
    expect(checkBox.get("text")).toBe("");
  });

  it("CheckBox select", function() {
    widget = new tabris.CheckBox().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("CheckBox change:selection", function() {
    widget = new tabris.CheckBox().on("change:selection", listener);
    tabris._notify(widget.cid, "select", {selection: true});
    checkEvent(true);
    checkListen("select");
  });

  it("Composite", function() {
    new tabris.Composite();

    expect(getCreate().type).toEqual("tabris.Composite");
  });

  it("ImageView", function() {
    var imageView = new tabris.ImageView();

    expect(getCreate().type).toEqual("tabris.ImageView");
    expect(imageView.get("image")).toBe(null);
    expect(imageView.get("scaleMode")).toBe("auto");
  });

  it("ProgressBar", function() {
    var progressBar = new tabris.ProgressBar();

    expect(getCreate().type).toEqual("tabris.ProgressBar");
    expect(progressBar.get("minimum")).toBe(0);
    expect(progressBar.get("maximum")).toBe(100);
    expect(progressBar.get("selection")).toBe(0);
    expect(progressBar.get("state")).toBe("normal");
  });

  it("RadioButton", function() {
    var radioButton = new tabris.RadioButton({enabled: false});

    expect(getCreate().type).toEqual("rwt.widgets.Button");
    expect(getCreate().properties).toEqual({style: ["RADIO"], enabled: false});
    expect(radioButton.get("text")).toBe("");
  });

  it("RadioButton select", function() {
    widget = new tabris.RadioButton().on("select", listener);
    tabris._notify(widget.cid, "Selection", {selection: true});
    checkEvent(true);
    checkListen("Selection");
  });

  it("RadioButton change:selection", function() {
    widget = new tabris.RadioButton().on("change:selection", listener);
    tabris._notify(widget.cid, "Selection", {selection: true});
    checkEvent(true);
    checkListen("Selection");
  });

  it("TextView", function() {
    var textView = new tabris.TextView({text: "foo"});

    expect(getCreate().type).toEqual("tabris.TextView");
    expect(getCreate().properties).toEqual({text: "foo"});
    expect(textView.get("alignment")).toBe("left");
    expect(textView.get("markupEnabled")).toBe(false);
    expect(textView.get("maxLines")).toBe(null);
  });

  it("TextView, maxLines: 0 is mapped to null", function() {
    new tabris.TextView({text: "foo", maxLines: 0});

    expect(getCreate().properties.maxLines).toBeNull();
  });

  it("TextView, maxLines: values <= 0 are mapped to null", function() {
    new tabris.TextView({text: "foo", maxLines: -1});

    expect(getCreate().properties.maxLines).toBeNull();
  });

  it("Slider", function() {
    var slider = new tabris.Slider({selection: 23});

    expect(getCreate().type).toEqual("tabris.Slider");
    expect(getCreate().properties).toEqual({selection: 23});
    expect(slider.get("minimum")).toBe(0);
    expect(slider.get("maximum")).toBe(100);
  });

  it("Slider select", function() {
    widget = new tabris.Slider().on("select", listener);
    tabris._notify(widget.cid, "select", {selection: 23});
    checkEvent(23);
    checkListen("select");
  });

  it("Slider change:selection", function() {
    widget = new tabris.RadioButton().on("change:selection", listener);
    tabris._notify(widget.cid, "Selection", {selection: 23});
    checkEvent(23);
    checkListen("Selection");
  });

  it("TextInput", function() {
    var textInput = new tabris.TextInput({text: "foo"});

    expect(getCreate().type).toEqual("tabris.TextInput");
    expect(getCreate().properties).toEqual({text: "foo"});
    expect(textInput.get("message")).toBe("");
    expect(textInput.get("alignment")).toBe("left");
    expect(textInput.get("keyboard")).toBe("default");
    expect(textInput.get("autoCorrect")).toBe(false);
    expect(textInput.get("autoCapitalize")).toBe(false);
  });

  it("TextInput input", function() {
    widget = new tabris.TextInput().on("input", listener);
    tabris._notify(widget.cid, "modify", {text: "foo"});
    checkEvent("foo");
    checkListen("modify");
  });

  it("TextInput accept", function() {
    widget = new tabris.TextInput().on("accept", listener);
    tabris._notify(widget.cid, "accept", {text: "foo"});
    checkEvent("foo");
    checkListen("accept");
  });

  it("TextInput change:text", function() {
    widget = new tabris.TextInput().on("change:text", listener);
    tabris._notify(widget.cid, "modify", {text: "foo"});
    checkEvent("foo");
    checkListen("modify");
  });

  it("WebView", function() {
    new tabris.WebView({html: "foo"});

    expect(getCreate().type).toEqual("rwt.widgets.Browser");
    expect(getCreate().properties).toEqual({html: "foo"});
  });

  it("Switch", function() {
    new tabris.Switch({selection: true});

    expect(getCreate().type).toEqual("tabris.Switch");
    expect(getCreate().properties).toEqual({selection: true});
  });

  it("Switch change:selection", function() {
    widget = new tabris.Switch().on("change:selection", listener);

    tabris._notify(widget.cid, "select", {selection: true});

    checkEvent(true);
    checkListen("select");
  });

  it("Switch change:selection on property change", function() {
    widget = new tabris.Switch().on("change:selection", listener);

    widget.set("selection", true);

    checkEvent(true);
  });

  it("Switch select", function() {
    widget = new tabris.Switch().on("select", listener);

    tabris._notify(widget.cid, "select", {selection: true});

    checkEvent(true);
    checkListen("select");
  });

  it("ToggleButton", function() {
    var toggleButton = new tabris.ToggleButton({enabled: false});

    expect(getCreate().type).toEqual("rwt.widgets.Button");
    expect(getCreate().properties).toEqual({style: ["TOGGLE"], enabled: false});
    expect(toggleButton.get("text")).toBe("");
    expect(toggleButton.get("image")).toBe(null);
    expect(toggleButton.get("alignment")).toBe("center");
  });

  it("ToggleButton change:selection", function() {
    widget = new tabris.ToggleButton().on("change:selection", listener);
    tabris._notify(widget.cid, "Selection", {selection: true});
    checkEvent(true);
    checkListen("Selection");
  });

  it("ToggleButton select", function() {
    widget = new tabris.ToggleButton().on("select", listener);
    tabris._notify(widget.cid, "Selection", {selection: true});
    checkEvent(true);
    checkListen("Selection");

  });

});

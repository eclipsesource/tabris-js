describe("Widgets", function() {
  /*globals _:false*/

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  describe("tabris.registerWidget", function() {

    it("adds default events copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._events.resize).toEqual(jasmine.any(Object));
      expect(tabris.TestType._events).not.toBe(tabris.registerWidget._defaultEvents);
    });

    it("extends default events", function() {
      var custom = {foo: {name: "bar"}, touchstart: {name: "touchstart"}};
      tabris.registerWidget("TestType", {_events: custom});
      expect(tabris.TestType._events).toEqual(
        _.extend({}, tabris.TestType._events, custom)
      );
    });

    it("adds default properties copy", function() {
      tabris.registerWidget("TestType", {});
      expect(tabris.TestType._properties).toEqual(tabris.registerWidget._defaultProperties);
      expect(tabris.TestType._properties).not.toBe(tabris.registerWidget._defaultProperties);
    });

    it("extends default properties", function() {
      var custom = {foo: "bar", enabled: false};
      var normalized = tabris.registerType.normalizePropertiesMap(custom);
      tabris.registerWidget("TestType", {_properties: custom});
      expect(tabris.TestType._properties).toEqual(
        _.extend({}, tabris.registerWidget._defaultProperties, normalized)
      );
    });

  });

  describe("any", function() {

    var widget;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      widget = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    it("translates textColor and background colors to arrays", function() {
      widget.set({textColor: "red", background: "rgba(1, 2, 3, 0.5)"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toEqual([255, 0, 0, 255]);
      expect(call.properties.background).toEqual([1, 2, 3, 128]);
    });

    it("translates font string to array", function() {
      widget.set({font: "12px Arial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.font).toEqual([["Arial"], 12, false, false]);
    });

    it("translates backgroundImage to array", function() {
      widget.set({backgroundImage: {src: "bar", width: 23, height: 42}});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.backgroundImage).toEqual(["bar", 23, 42, null]);
    });

    it("prints warning when attempting to set bounds", function() {
      spyOn(console, "warn");
      widget.set("bounds", {left: 1, top: 2, width: 3, height: 4});

      expect(nativeBridge.calls({op: "set"}).length).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        "TestType: Can not set read-only property \"bounds\"."
      );
    });

    it("translates visible to visibility", function() {
      widget.set("visible", true);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.visibility).toBe(true);
    });

    it("support 'initial' for textColor, background and font", function() {
      widget.set({textColor: "initial", background: "initial", font: "initial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toBeNull();
      expect(call.properties.background).toBeNull();
      expect(call.properties.font).toBeNull();
    });

    it("stores id property in proxy.id", function() {
      widget.set("id", "foo");

      expect(widget.id).toBe("foo");
    });

    it("gets id property from proxy.id", function() {
      widget.set("id", "foo");

      expect(widget.get("id")).toBe("foo");
    });

    it("stores class property in proxy.classList", function() {
      widget.set("class", "foo bar");

      expect(widget.classList).toEqual(["foo", "bar"]);
    });

    it("normalizes class property", function() {
      widget.set("class", " foo bar   foobar  ");

      expect(widget.get("class")).toBe("foo bar foobar");
    });

    it("has default class property value", function() {
      expect(widget.get("class")).toBe("");
      expect(widget.classList.length).toBe(0);
    });

    it("returns default initial default values", function() {
      expect(widget.get("highlightOnTouch")).toBe(false);
      expect(widget.get("enabled")).toBe(true);
      expect(widget.get("visible")).toBe(true);
      expect(widget.get("layoutData")).toBe(null);
      expect(widget.get("opacity")).toBe(1);
      expect(widget.get("transform")).toEqual({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0
      });
    });

  });

  describe("get default decoding", function() {

    var widget;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      widget = tabris.create("TestType");
      nativeBridge.resetCalls();
    });

    it("translates textColor to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

      var result = widget.get("textColor");

      expect(result).toBe("rgba(170, 255, 0, 0.5)");
    });

    it("translates background to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([170, 255, 0, 128]);

      var result = widget.get("background");

      expect(result).toBe("rgba(170, 255, 0, 0.5)");
    });

    it("translates background null to string", function() {
      spyOn(nativeBridge, "get").and.returnValue(null);

      var result = widget.get("background");

      expect(result).toBe("rgba(0, 0, 0, 0)");
    });

    it("translates font to string", function() {
      spyOn(nativeBridge, "get").and.returnValue([["Arial"], 12, true, true]);

      var result = widget.get("font");

      expect(result).toBe("italic bold 12px Arial");
    });

    it("translates bounds to object", function() {
      spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

      var result = widget.get("bounds");

      expect(result).toEqual({left: 1, top: 2, width: 3, height: 4});
    });

    it("translates bounds to object", function() {
      spyOn(nativeBridge, "get").and.returnValue([1, 2, 3, 4]);

      var result = widget.get("bounds");

      expect(result).toEqual({left: 1, top: 2, width: 3, height: 4});
    });

    it("translates backgroundImage to object", function() {
      spyOn(nativeBridge, "get").and.returnValue(["foo", 23, 42]);

      var result = widget.get("backgroundImage");

      expect(result).toEqual({src: "foo", width: 23, height: 42});
    });

  });

  describe("layoutData:", function() {

    var parent, widget, other;

    beforeEach(function() {
      tabris.registerWidget("TestType", {});
      parent = tabris.create("Composite");
      widget = tabris.create("TestType").appendTo(parent);
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
      nativeBridge.resetCalls();
    });

    it("return null for undefined layoutData", function() {
      expect(widget.get("layoutData")).toBeNull();
    });

    it("store layoutData property locally", function() {
      widget.set("layoutData", {top: 10, left: [10, 20], right: [other, 10]});
      expect(widget.get("layoutData")).toEqual({top: 10, left: [10, 20], right: [other, 10]});
    });

    it("getter does not translate selectors", function() {
      widget.set("layoutData", {left: 23, right: "#other", top: ["#other", 42]});

      var expected = {left: 23, right: "#other", top: ["#other", 42]};
      expect(widget.get("layoutData")).toEqual(expected);
    });

    it("SET layoutData after widget referenced by selector is added to parent", function() {
      other.dispose();
      widget.set("layoutData", {left: 23, centerY: "#other", right: ["#other", 42]});
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {left: 23, centerY: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData after self is added to parent", function() {
      widget = tabris.create("TestType");

      widget.set("layoutData", {left: 23, centerY: "#other", right: ["#other", 42]});
      widget.appendTo(parent);

      var call = nativeBridge.calls({op: "create"})[0];
      var expected = {left: 23, centerY: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET preliminary layoutData if selector does not resolve in flush", function() {
      widget.set("layoutData", {left: 23, centerY: "#mother", right: ["other", 42]});

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {left: 23, centerY: 0, right: [0, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData again until selector resolves by adding sibling", function() {
      other.dispose();

      widget.set("layoutData", {right: "#other"});
      var withoutSibling = nativeBridge.calls({op: "set"});
      var retry = nativeBridge.calls({op: "set"});
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
      var withSibling = nativeBridge.calls({op: "set"});
      var noRetry = nativeBridge.calls({op: "set"});

      expect(withoutSibling.length).toBe(1);
      expect(retry.length).toBe(1);
      expect(withSibling.length).toBe(2);
      expect(noRetry.length).toBe(2);
      expect(withoutSibling[0].properties.layoutData).toEqual({right: [0, 0]});
      expect(withSibling[1].properties.layoutData).toEqual({right: [other.cid, 0]});
    });

    it("SET layoutData again until selector resolves by setting parent", function() {
      widget = tabris.create("TestType");
      nativeBridge.resetCalls();

      widget.set("layoutData", {right: "#other"});
      var withoutParent = nativeBridge.calls({op: "set"});
      var retry = nativeBridge.calls({op: "set"});
      widget.appendTo(parent);
      var withParent = nativeBridge.calls({op: "set"});
      var noRetry = nativeBridge.calls({op: "set"});

      expect(withoutParent.length).toBe(1);
      expect(retry.length).toBe(1);
      expect(withParent.length).toBe(2);
      expect(noRetry.length).toBe(2);
      expect(withoutParent[0].properties.layoutData).toEqual({right: [0, 0]});
      expect(withParent[1].properties.layoutData).toEqual({right: [other.cid, 0]});
    });

  });

  describe("registered types:", function() {

    var getCreate = function() {
      return nativeBridge.calls({op: "create"})[0];
    };

    it("Button", function() {
      var button = tabris.create("Button", {enabled: false});

      expect(getCreate().type).toEqual("rwt.widgets.Button");
      expect(getCreate().properties).toEqual({style: ["PUSH"], enabled: false});
      expect(button.get("image")).toBe(null);
      expect(button.get("alignment")).toBe("center");
      expect(button.get("text")).toBe("");
    });

    it("Canvas", function() {
      tabris.create("Canvas", {});

      expect(getCreate().type).toEqual("rwt.widgets.Canvas");
    });

    it("CheckBox", function() {
      var checkBox = tabris.create("CheckBox", {enabled: false});

      expect(getCreate().type).toEqual("rwt.widgets.Button");
      expect(getCreate().properties).toEqual({style: ["CHECK"], enabled: false});
      expect(checkBox.get("text")).toBe("");
    });

    it("Composite", function() {
      tabris.create("Composite", {});

      expect(getCreate().type).toEqual("rwt.widgets.Composite");
    });

    it("ImageView", function() {
      var imageView = tabris.create("ImageView", {});

      expect(getCreate().type).toEqual("tabris.ImageView");
      expect(imageView.get("image")).toBe(null);
      expect(imageView.get("scaleMode")).toBe("auto");
    });

    it("ProgressBar", function() {
      var progressBar = tabris.create("ProgressBar");

      expect(getCreate().type).toEqual("rwt.widgets.ProgressBar");
      expect(progressBar.get("minimum")).toBe(0);
      expect(progressBar.get("maximum")).toBe(100);
      expect(progressBar.get("selection")).toBe(0);
      expect(progressBar.get("state")).toBe("normal");
    });

    it("RadioButton", function() {
      var radioButton = tabris.create("RadioButton", {enabled: false});

      expect(getCreate().type).toEqual("rwt.widgets.Button");
      expect(getCreate().properties).toEqual({style: ["RADIO"], enabled: false});
      expect(radioButton.get("text")).toBe("");
    });

    it("ToggleButton", function() {
      var toggleButton = tabris.create("ToggleButton", {enabled: false});

      expect(getCreate().type).toEqual("rwt.widgets.Button");
      expect(getCreate().properties).toEqual({style: ["TOGGLE"], enabled: false});
      expect(toggleButton.get("text")).toBe("");
      expect(toggleButton.get("image")).toBe(null);
      expect(toggleButton.get("alignment")).toBe("center");
    });

    it("TextView", function() {
      var textView = tabris.create("TextView", {text: "foo"});

      expect(getCreate().type).toEqual("tabris.TextView");
      expect(getCreate().properties).toEqual({text: "foo"});
      expect(textView.get("alignment")).toBe("left");
      expect(textView.get("markupEnabled")).toBe(false);
      expect(textView.get("maxLines")).toBe(null);
    });

    it("TextView, maxLines: 0 is mapped to null", function() {
      tabris.create("TextView", {text: "foo", maxLines: 0});

      expect(getCreate().properties.maxLines).toBeNull();
    });

    it("TextView, maxLines: values <= 0 are mapped to null", function() {
      tabris.create("TextView", {text: "foo", maxLines: -1});

      expect(getCreate().properties.maxLines).toBeNull();
    });

    it("Slider", function() {
      var slider = tabris.create("Slider", {selection: 23});

      expect(getCreate().type).toEqual("rwt.widgets.Scale");
      expect(getCreate().properties).toEqual({selection: 23});
      expect(slider.get("minimum")).toBe(0);
      expect(slider.get("maximum")).toBe(100);
    });

    it("TextInput", function() {
      var textInput = tabris.create("TextInput", {text: "foo"});

      expect(getCreate().type).toEqual("tabris.TextInput");
      expect(getCreate().properties).toEqual({text: "foo"});
      expect(textInput.get("message")).toBe("");
      expect(textInput.get("alignment")).toBe("left");
      expect(textInput.get("keyboard")).toBe("default");
      expect(textInput.get("autoCorrect")).toBe(false);
      expect(textInput.get("autoCapitalize")).toBe(false);
    });

    it("WebView", function() {
      tabris.create("WebView", {html: "foo"});

      expect(getCreate().type).toEqual("rwt.widgets.Browser");
      expect(getCreate().properties).toEqual({html: "foo"});
    });

  });

  describe("native events:", function() {

    var listener, widget;
    var checkEvent = function(value) {
      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(widget);
      if (arguments.length > 0) {
        expect(listener.calls.argsFor(0)[1]).toEqual(value);
        expect(listener.calls.argsFor(0)[2]).toEqual(arguments[1] || {});
      } else {
        expect(listener.calls.argsFor(0)[1]).toEqual({});
      }
    };
    var checkListen = function(event) {
      var listen = nativeBridge.calls({op: "listen", id: widget.cid});
      expect(listen.length).toBe(1);
      expect(listen[0].event).toBe(event);
      expect(listen[0].listen).toBe(true);
    };

    beforeEach(function() {
      listener = jasmine.createSpy();
    });

    it("Widget change:bounds", function() {
      widget = tabris.create("CheckBox").on("change:bounds", listener);
      tabris._notify(widget.cid, "Resize", {bounds: [1, 2, 3, 4]});
      checkEvent({left: 1, top: 2, width: 3, height: 4});
      checkListen("Resize");
    });

    it("Widget resize", function() {
      widget = tabris.create("CheckBox").on("resize", listener);
      tabris._notify(widget.cid, "Resize", {bounds: [1, 2, 3, 4]});
      checkEvent({left: 1, top: 2, width: 3, height: 4});
      checkListen("Resize");
    });

    it("Button select", function() {
      widget = tabris.create("Button").on("select", listener);
      tabris._notify(widget.cid, "Selection", {});
      checkEvent();
      checkListen("Selection");
    });

    it("CheckBox select", function() {
      widget = tabris.create("CheckBox").on("select", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");
    });

    it("CheckBox change:selection", function() {
      widget = tabris.create("CheckBox").on("change:selection", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");
    });

    it("RadioButton select", function() {
      widget = tabris.create("RadioButton").on("select", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");
    });

    it("RadioButton change:selection", function() {
      widget = tabris.create("RadioButton").on("change:selection", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");
    });

    it("Slider select", function() {
      widget = tabris.create("Slider").on("select", listener);
      tabris._notify(widget.cid, "Selection", {selection: 23});
      checkEvent(23);
      checkListen("Selection");
    });

    it("Slider change:selection", function() {
      widget = tabris.create("RadioButton").on("change:selection", listener);
      tabris._notify(widget.cid, "Selection", {selection: 23});
      checkEvent(23);
      checkListen("Selection");
    });

    it("TextInput change:text", function() {
      widget = tabris.create("TextInput").on("change:text", listener);
      tabris._notify(widget.cid, "modify", {text: "foo"});
      checkEvent("foo");
      checkListen("modify");
    });

    it("ToggleButton select", function() {
      widget = tabris.create("ToggleButton").on("select", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");

    });

    it("TextInput input", function() {
      widget = tabris.create("TextInput").on("input", listener);
      tabris._notify(widget.cid, "modify", {text: "foo"});
      checkEvent("foo");
      checkListen("modify");
    });

    it("TextInput accept", function() {
      widget = tabris.create("TextInput").on("accept", listener);
      tabris._notify(widget.cid, "accept", {text: "foo"});
      checkEvent("foo");
      checkListen("accept");
    });

    it("ToggleButton change:selection", function() {
      widget = tabris.create("ToggleButton").on("change:selection", listener);
      tabris._notify(widget.cid, "Selection", {selection: true});
      checkEvent(true);
      checkListen("Selection");
    });

  });

  describe("dispose", function() {

    var parent, child;

    beforeEach(function() {
      parent = tabris.create("Composite");
      child = tabris.create("TextView").appendTo(parent);
      nativeBridge.resetCalls();
    });

    it("disposes children", function() {
      parent.dispose();

      expect(child.isDisposed()).toBe(true);
    });

    it("removes from parent", function() {
      child.dispose();

      expect(parent.children().toArray()).toEqual([]);
    });

    it("removes parent", function() {
      child.dispose();

      expect(child.parent()).not.toBeDefined();
    });

    it("DESTROYs native widget", function() {
      parent.dispose();

      expect(nativeBridge.calls({op: "destroy", id: parent.cid}).length).toBe(1);
    });

    it("does not send native DESTROY for children", function() {
      parent.dispose();

      expect(nativeBridge.calls({op: "destroy", id: child.cid}).length).toBe(0);
    });

    it("notifies parent's remove listeners", function() {
      var listener = jasmine.createSpy();
      parent.on("removechild", listener);

      child.dispose();

      var args = listener.calls.argsFor(0);
      expect(args[0]).toBe(parent);
      expect(args[1]).toBe(child);
      expect(args[2]).toEqual({index: 0});
    });

    it("notifies all children's dispose listeners", function() {
      var log = [];
      var child2 = tabris.create("TextView", {}).appendTo(parent);
      parent.on("dispose", function() {
        log.push("parent");
      });
      child.on("dispose", function() {
        log.push("child");
      });
      child2.on("dispose", function() {
        log.push("child2");
      });

      parent.dispose();

      expect(log).toEqual(["parent", "child", "child2"]);
    });

    it("notifies children's dispose listeners recursively", function() {
      var log = [];
      child = tabris.create("Composite", {}).appendTo(parent);
      var grandchild = tabris.create("TextView", {}).appendTo(child);
      parent.on("dispose", function() {
        log.push("parent");
      });
      child.on("dispose", function() {
        log.push("child");
      });
      grandchild.on("dispose", function() {
        log.push("grandchild");
      });

      parent.dispose();

      expect(log).toEqual(["parent", "child", "grandchild"]);
    });

  });

});

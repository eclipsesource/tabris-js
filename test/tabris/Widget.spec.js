describe("Widget", function() {
  /*globals _:false*/

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    tabris.registerWidget("TestType", {
      _supportsChildren: true
    });
  });

  afterEach(function() {
    delete tabris.TestType;
  });

  describe("constructor", function() {

    it("prevents instantiation", function() {
      expect(() => {
        new tabris.Widget();
      }).toThrowError("Cannot instantiate abstract Widget");
    });

  });

  describe("instance", function() {

    var widget;

    beforeEach(function() {
      widget = new tabris.TestType();
      nativeBridge.resetCalls();
    });

    it("is a Proxy instance", function() {
      expect(widget).toEqual(jasmine.any(tabris.Widget));
    });

    it("translates textColor and background colors to arrays", function() {
      widget.set({textColor: "red", background: "rgba(1, 2, 3, 0.5)"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toEqual([255, 0, 0, 255]);
      expect(call.properties.background).toEqual([1, 2, 3, 128]);
    });

    it("translates font string to object", function() {
      widget.set({font: "12px Arial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.font)
        .toEqual({family: ["Arial"], size: 12, style: "normal", weight: "normal"});
    });

    it("normalizes font string", function() {
      widget.set({font: "bold italic   12px Arial"});

      expect(widget.get("font")).toEqual("italic bold 12px Arial");
    });

    it("returns 'initial' when no value is cached", function() {
      spyOn(nativeBridge, "get");

      expect(widget.get("font")).toEqual("initial");
      expect(nativeBridge.get).not.toHaveBeenCalled();
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

    it("sets elevation to value", function() {
      widget.set("elevation", 8);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.elevation).toBe(8);
    });

    it("sets cornerRadius to value", function() {
      widget.set("cornerRadius", 4);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.cornerRadius).toBe(4);
    });

    ["light", "dark", "default"].forEach((value) => {

      it("sets win_theme to valid value", function() {
        widget.set("win_theme", value);

        var call = nativeBridge.calls({op: "set"})[0];
        expect(call.properties.win_theme).toBe(value);
      });

    });

    it("ignores setting win_theme to invalid value", function() {
      spyOn(console, "warn");
      widget.set("win_theme", "foo");

      expect(nativeBridge.calls({op: "set"}).length).toBe(0);
    });

    it("returns win_theme default value", function() {
      expect(widget.get("win_theme")).toBe("default");
    });

    it("translates visible to visibility", function() {
      widget.set("visible", true);

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.visibility).toBe(true);
    });

    it("support 'initial' for textColor, background and font", function() {
      widget.set({textColor: "red", background: "green", font: "23px Arial"});
      nativeBridge.resetCalls();
      widget.set({textColor: "initial", background: "initial", font: "initial"});

      var call = nativeBridge.calls({op: "set"})[0];
      expect(call.properties.foreground).toBeNull();
      expect(call.properties.background).toBeNull();
      expect(call.properties.font).toBeNull();
    });

    it("stores id property in widget.id", function() {
      widget.set("id", "foo");

      expect(widget.id).toBe("foo");
    });

    it("gets id property from widget.id", function() {
      widget.set("id", "foo");

      expect(widget.get("id")).toBe("foo");
    });

    it("stores class property in widget.classList", function() {
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

    it("can modify class property value", function() {
      widget.classList.push("foo");
      widget.classList.push("bar");

      expect(widget.get("class")).toBe("foo bar");
    });

    it("returns default initial default values", function() {
      expect(widget.get("highlightOnTouch")).toBe(false);
      expect(widget.get("enabled")).toBe(true);
      expect(widget.get("visible")).toBe(true);
      expect(widget.get("layoutData")).toBe(null);
      expect(widget.get("elevation")).toBe(0);
      expect(widget.get("cornerRadius")).toBe(0);
      expect(widget.get("opacity")).toBe(1);
      expect(widget.get("transform")).toEqual({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      });
    });

    describe("dispose", function() {

      var parent, child;

      beforeEach(function() {
        parent = new tabris.Composite();
        child = new tabris.TextView().appendTo(parent);
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
        var child2 = new tabris.TextView().appendTo(parent);
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
        child = new tabris.Composite().appendTo(parent);
        var grandchild = new tabris.TextView().appendTo(child);
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

    describe("append", function() {

      var widget, child1, child2, listener, result;

      beforeEach(function() {
        widget = new tabris.TestType();
        child1 = new tabris.TextView();
        child2 = new tabris.Button();
        nativeBridge.resetCalls();
        listener = jasmine.createSpy();
      });

      describe("when called with a widget", function() {

        beforeEach(function() {
          widget.on("addchild", listener);
          result = widget.append(child1);
        });

        it("sets the child's parent", function() {
          var calls = nativeBridge.calls();
          expect(calls.length).toBe(1);
          expect(calls[0]).toEqual({op: "set", id: child1.cid, properties: {parent: widget.cid}});
        });

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

        it("notifies add listeners with arguments parent, child, event", function() {
          var args = listener.calls.argsFor(0);
          expect(args[0]).toBe(widget);
          expect(args[1]).toBe(child1);
          expect(args[2]).toEqual({});
        });

        it("children() contains appended child", function() {
          expect(widget.children()).toContain(child1);
        });

        it("children() returns a safe copy", function() {
          widget.children()[0] = null;
          expect(widget.children()).toContain(child1);
        });

      });

      describe("when called with multiple proxies", function() {

        beforeEach(function() {
          result = widget.append(child1, child2);
        });

        it("sets the children's parent", function() {
          var calls = nativeBridge.calls();
          expect(calls.length).toBe(2);
          expect(calls[1]).toEqual({op: "set", id: child2.cid, properties: {parent: widget.cid}});
        });

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

        it("children() contains appended children", function() {
          expect(widget.children()).toContain(child1);
          expect(widget.children()).toContain(child2);
        });

        it("children() with matcher contains filtered children", function() {
          expect(widget.children("TextView").toArray()).toEqual([child1]);
          expect(widget.children("Button").toArray()).toEqual([child2]);
        });

      });

      describe("when called with an array of widgets", function() {

        beforeEach(function() {
          result = widget.append([child1, child2]);
        });

        it("sets the widgets' parent", function() {
          var calls = nativeBridge.calls();
          expect(calls.length).toBe(2);
          expect(calls[0]).toEqual({op: "set", id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).toEqual({op: "set", id: child2.cid, properties: {parent: widget.cid}});
        });

        it("adds the widgets to children list", function() {
          expect(widget.children().toArray()).toEqual([child1, child2]);
        });

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

      });

      describe("when called with a widget collection", function() {

        beforeEach(function() {
          result = widget.append(new tabris.ProxyCollection([child1, child2]));
        });

        it("sets the widgets' parent", function() {
          var calls = nativeBridge.calls();
          expect(calls.length).toBe(2);
          expect(calls[0]).toEqual({op: "set", id: child1.cid, properties: {parent: widget.cid}});
          expect(calls[1]).toEqual({op: "set", id: child2.cid, properties: {parent: widget.cid}});
        });

        it("adds the widgets to children list", function() {
          expect(widget.children().toArray()).toEqual([child1, child2]);
        });

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

      });

      describe("when called with non-widget", function() {

        it("throws an error", function() {
          expect(() => {
            widget.append({});
          }).toThrowError("Cannot append non-widget");
        });

      });

      describe("when children are not supported", function() {

        it("throws an error", function() {
          tabris.TestType._supportsChildren = false;
          var child = new tabris.TextView();

          expect(() => {
            widget.append(child);
          }).toThrowError("TestType cannot contain children");
          expect(widget.children()).not.toContain(child);
        });

      });

      describe("when called with children of unsupported type", function() {

        it("logs an error", function() {
          tabris.TestType._supportsChildren = function() { return false; };
          var child = new tabris.TextView();

          expect(() => {
            widget.append(child);
          }).toThrowError("TestType cannot contain children of type TextView");
          expect(widget.children()).not.toContain(child);
        });

      });

    });

    describe("appendTo", function() {

      var parent1, result;

      beforeEach(function() {
        parent1 = new tabris.Composite();
        nativeBridge.resetCalls();
        result = widget.appendTo(parent1);
      });

      describe("when called with a parent", function() {

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

        it("sets the widget's parent", function() {
          var setCall = nativeBridge.calls({op: "set", id: widget.cid})[0];
          expect(setCall.properties.parent).toEqual(parent1.cid);
        });

        it("is added to parent's children list", function() {
          expect(parent1.children()).toContain(widget);
        });

        it("parent() returns new parent", function() {
          expect(result.parent()).toBe(parent1);
        });

      });

      describe("when called with another parent", function() {

        var parent2;

        beforeEach(function() {
          parent2 = new tabris.Composite();
          widget.appendTo(parent2);
        });

        it("is removed from old parent's children list", function() {
          expect(parent1.children()).not.toContain(widget);
        });

        it("is added to new parent's children list", function() {
          expect(parent2.children()).toContain(widget);
        });
      });

      describe("when called with a collection", function() {

        var parent1, parent2, result;

        beforeEach(function() {
          parent1 = new tabris.Composite();
          parent2 = new tabris.Composite();
          nativeBridge.resetCalls();
          result = widget.appendTo(new tabris.ProxyCollection([parent1, parent2]));
        });

        it("returns self to allow chaining", function() {
          expect(result).toBe(widget);
        });

        it("first entry is added to parent's children list", function() {
          expect(parent1.children()).toContain(widget);
        });

        it("other entry not added to parent's children list", function() {
          expect(parent2.children()).not.toContain(widget);
        });

      });

      describe("when called with non-widget", function() {

        it("throws an error", function() {
          expect(() => {
            widget.appendTo({});
          }).toThrowError("Cannot append to non-widget");
        });

      });

    });

    describe("insertBefore", function() {

      var parent1, parent2, other;

      beforeEach(function() {
        parent1 = new tabris.Composite();
        parent2 = new tabris.Composite();
      });

      it("throws when disposed", function() {
        expect(() => {
          widget.insertBefore({});
        }).toThrowError("Cannot insert before non-widget");
      });

      it("throws when called with a non-widget", function() {
        expect(() => {
          widget.insertBefore({});
        }).toThrowError("Cannot insert before non-widget");
      });

      it("throws when called with an empty widget collection", function() {
        expect(() => {
          widget.insertBefore(parent1.find(".missing"));
        }).toThrowError("Cannot insert before non-widget");
      });

      describe("when called with a widget", function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new tabris.Button().appendTo(parent2);
          widget.insertBefore(other);
        });

        it("removes widget from its old parent's children list", function() {
          expect(parent1.children()).not.toContain(widget);
        });

        it("adds widget to new parent's children list", function() {
          expect(parent2.children()).toContain(widget);
        });

        it("adds widget directly before the given widget", function() {
          var children = parent2.children();
          expect(children.indexOf(widget)).toBe(children.indexOf(other) - 1);
        });

      });

      describe("when called with a sibling widget", function() {

        beforeEach(function() {
          other = new tabris.Button().appendTo(parent1);
          widget.appendTo(parent1);
          widget.insertBefore(other);
        });

        it("re-orders widgets", function() {
          expect(parent1.children().toArray()).toEqual([widget, other]);
        });

      });

      describe("when called with a widget collection", function() {

        beforeEach(function() {
          new tabris.Button().appendTo(parent1);
          new tabris.Button().appendTo(parent2);
          var grandparent = new tabris.Composite().append(parent1, parent2);
          widget.insertBefore(grandparent.find("Button"));
        });

        it("inserts only before the first the widget of the collection", function() {
          expect(parent1.children()).toContain(widget);
          expect(parent2.children()).not.toContain(widget);
        });

      });

    });

    describe("insertAfter", function() {

      var parent1, parent2, other;

      beforeEach(function() {
        parent1 = new tabris.Composite();
        parent2 = new tabris.Composite();
      });

      it("throws when disposed", function() {
        widget.dispose();

        expect(() => {
          widget.insertAfter({});
        }).toThrowError("Object is disposed");
      });

      it("throws when called with a non-widget", function() {
        expect(() => {
          widget.insertAfter({});
        }).toThrowError("Cannot insert after non-widget");
      });

      it("throws when called with an empty widget collection", function() {
        expect(() => {
          widget.insertAfter(parent1.find(".missing"));
        }).toThrowError("Cannot insert after non-widget");
      });

      describe("when called with a widget", function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new tabris.Button().appendTo(parent2);
          widget.insertAfter(other);
        });

        it("removes widget from its old parent's children list", function() {
          expect(parent1.children()).not.toContain(widget);
        });

        it("adds widget to new parent's children list", function() {
          expect(parent2.children()).toContain(widget);
        });

        it("adds widget directly after the given widget", function() {
          var children = parent2.children();
          expect(children.indexOf(widget)).toBe(children.indexOf(other) + 1);
        });

      });

      describe("when called with a sibling widget", function() {

        beforeEach(function() {
          widget.appendTo(parent1);
          other = new tabris.Button().appendTo(parent1);
          widget.insertAfter(other);
        });

        it("re-orders widgets", function() {
          expect(parent1.children().toArray()).toEqual([other, widget]);
        });

      });

      describe("when called with a widget collection", function() {

        beforeEach(function() {
          new tabris.Button().appendTo(parent1);
          new tabris.Button().appendTo(parent2);
          var grandparent = new tabris.Composite().append(parent1, parent2);
          widget.insertAfter(grandparent.find("Button"));
        });

        it("inserts only before the first the widget of the collection", function() {
          expect(parent1.children()).toContain(widget);
          expect(parent2.children()).not.toContain(widget);
        });

      });

    });

    describe("siblings", function() {

      var child1, child2, child3;

      beforeEach(function() {
        child1 = new tabris.Composite();
        child2 = new tabris.Composite();
        child3 = new tabris.Composite();
      });

      it("returns empty collection when called without a parent", function() {
        expect(widget.siblings().toArray()).toEqual([]);
      });

      it("returns empty collection when there are no siblings", function() {
        widget.append(child1);

        expect(child1.siblings().toArray()).toEqual([]);
      });

      it("returns collection with all siblings", function() {
        widget.append(child1, child2, child3);

        expect(child2.siblings().toArray()).toEqual([child1, child3]);
      });

      it("does not include grand children", function() {
        widget.append(child1, child2);
        child2.append(child3);

        expect(child1.siblings().toArray()).toEqual([child2]);
      });

      it("returns filtered list when called with a selector", function() {
        var button1 = new tabris.Button();
        var button2 = new tabris.Button();
        widget.append(child1, button1, child2, button2, child3);

        expect(child1.siblings("Button").toArray()).toEqual([button1, button2]);
      });

    });

  });

  describe("get default decoding", function() {

    var widget;

    beforeEach(function() {
      widget = new tabris.TestType();
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
      parent = new tabris.Composite();
      widget = new tabris.TestType().appendTo(parent);
      other = new tabris.TestType({id: "other"}).appendTo(parent);
      nativeBridge.resetCalls();
    });

    it("return null for undefined layoutData", function() {
      expect(widget.get("layoutData")).toBeNull();
    });

    it("store layoutData property locally", function() {
      widget.set("layoutData", {top: 10, left: ["#other", 10]});

      expect(widget.get("layoutData")).toEqual({top: 10, left: ["#other", 10]});
    });

    it("getter does not translate selectors", function() {
      widget.set("layoutData", {top: "#other", left: ["#other", 42]});

      expect(widget.get("layoutData")).toEqual({top: "#other", left: ["#other", 42]});
    });

    it("getter does not translate widgets", function() {
      widget.set("layoutData", {top: other, left: [other, 42]});

      expect(widget.get("layoutData")).toEqual({top: other, left: [other, 42]});
    });

    it("getter returns normalized percentages in arrays", function() {
      widget.set("layoutData", {left: "32%", top: [23, 42]});

      expect(widget.get("layoutData")).toEqual({left: "32%", top: ["23%", 42]});
    });

    it("getter returns arrays with zero percentage as plain offset", function() {
      widget.set("layoutData", {left: "32%", top: [0, 42]});

      expect(widget.get("layoutData")).toEqual({left: "32%", top: 42});
    });

    it("getter normalizes arrays with zero offset", function() {
      widget.set("layoutData", {left: ["#other", 0], top: [33, 0]});

      expect(widget.get("layoutData")).toEqual({left: "#other", top: "33%"});
    });

    it("getter replaces zero percentage", function() {
      widget.set("layoutData", {left: "0%", top: ["0%", 23]});

      expect(widget.get("layoutData")).toEqual({left: 0, top: 23});
    });

    it("SET layoutData after widget referenced by selector is added to parent", function() {
      other.dispose();
      widget.set("layoutData", {left: 23, baseline: "#other", right: ["#other", 42]});
      other = new tabris.TestType({id: "other"}).appendTo(parent);

      var call = nativeBridge.calls({op: "set", id: widget.cid})[0];
      var expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData after self is added to parent", function() {
      widget = new tabris.TestType();

      widget.set("layoutData", {left: 23, baseline: "#other", right: ["#other", 42]});
      widget.appendTo(parent);

      var call = nativeBridge.calls({op: "create"})[0];
      var expected = {left: 23, baseline: other.cid, right: [other.cid, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET preliminary layoutData if selector does not resolve in flush", function() {
      widget.set("layoutData", {left: 23, baseline: "#mother", right: ["other", 42]});

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {left: 23, baseline: 0, right: [0, 42]};
      expect(call.properties.layoutData).toEqual(expected);
    });

    it("SET layoutData again until selector resolves by adding sibling", function() {
      other.dispose();

      widget.set("layoutData", {right: "#other"});
      var withoutSibling = nativeBridge.calls({op: "set"});
      var retry = nativeBridge.calls({op: "set"});
      other = new tabris.TestType({id: "other"}).appendTo(parent);
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
      widget = new tabris.TestType();
      var oldParent = new tabris.Composite();
      widget.appendTo(oldParent);
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

  describe("layout attributes", function() {

    var parent, widget, other;

    beforeEach(function() {
      parent = new tabris.Composite();
      other = new tabris.TextView({id: "other"}).appendTo(parent);
      widget = new tabris.TextView().appendTo(parent);
      nativeBridge.resetCalls();
    });

    ["left", "right", "top", "bottom"].forEach((attr) => {

      it("modifies layoutData", function() {
        widget.set(attr, ["#other", 10]);

        expect(widget.get("layoutData")[attr]).toEqual(["#other", 10]);
      });

      it("resets layoutData properties", function() {
        var layoutData = {left: 1, right: 2, top: 3, bottom: 4};
        widget.set("layoutData", layoutData);
        widget.set(attr, null);

        expect(widget.get("layoutData")).toEqual(_.omit(layoutData, attr));
      });

      it("getter does not translate selectors", function() {
        widget.set(attr, ["#other", 10]);

        expect(widget.get(attr)).toEqual(["#other", 10]);
      });

      it("getter does not translate widgets", function() {
        widget.set(attr, [other, 42]);

        expect(widget.get(attr)).toEqual([other, 42]);
      });

      it("getter returns normalized percentages in arrays", function() {
        widget.set(attr, [23, 42]);

        expect(widget.get(attr)).toEqual(["23%", 42]);
      });

      it("getter returns arrays with zero percentage as plain offset", function() {
        widget.set(attr, [0, 42]);

        expect(widget.get(attr)).toBe(42);
      });

      it("getter returns offset 0 as plain 0", function() {
        widget.set(attr, 0);

        expect(widget.get(attr)).toBe(0);
      });

      it("getter normalizes arrays with zero offset", function() {
        widget.set(attr, ["#other", 0]);

        expect(widget.get(attr)).toBe("#other");
      });

      it("SETs layoutData", function() {
        widget.set(attr, 23);

        var call = nativeBridge.calls({op: "set"})[0];
        var expected = {};
        expected[attr] = 23;
        expect(call.properties.layoutData).toEqual(expected);
      });

    });

    ["width", "height", "centerX", "centerY"].forEach((attr) => {

      it("modifies layoutData", function() {
        widget.set(attr, 23);

        expect(widget.get("layoutData")[attr]).toBe(23);
      });

      it("resets layoutData properties", function() {
        var layoutData = {centerX: 0, centerY: 0, width: 100, height: 200};
        widget.set("layoutData", layoutData);
        widget.set(attr, null);

        expect(widget.get("layoutData")).toEqual(_.omit(layoutData, attr));
      });

      it("SETs layoutData", function() {
        widget.set(attr, 23);

        var call = nativeBridge.calls({op: "set"})[0];
        var expected = {};
        expected[attr] = 23;
        expect(call.properties.layoutData).toEqual(expected);
      });

    });

    it("contradicting attributes can be set temporarily without warning", function() {
      spyOn(console, "warn");

      widget.set("left", 10).set("width", 10).set("right", 10).set("left", null);

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {right: 10, width: 10};
      expect(call.properties.layoutData).toEqual(expected);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("contradicting attributes will be warned against on flush", function() {
      spyOn(console, "warn");

      widget.set("left", 10).set("width", 10).set("right", 10);

      var call = nativeBridge.calls({op: "set"})[0];
      var expected = {right: 10, left: 10};
      expect(call.properties.layoutData).toEqual(expected);
      expect(console.warn).toHaveBeenCalled();
    });

  });

  describe("flushLayout", function() {

    var parent, child;

    beforeEach(function() {
      parent = new tabris.Composite();
      tabris.Layout.flushQueue();
    });

    it("calls renderLayoutData on children", function() {
      child = new tabris.Button({
        layoutData: {left: 23, top: 42}
      }).appendTo(parent);
      nativeBridge.resetCalls();

      parent._flushLayout();

      var call = nativeBridge.calls({op: "set", id: child.cid})[0];
      expect(call.properties.layoutData).toEqual({left: 23, top: 42});
    });

    it("does not fail when there are no children", function() {
      expect(() => {
        parent._flushLayout();
      }).not.toThrow();
    });

    it("is triggered by appending a child", function() {
      spyOn(parent, "_flushLayout");
      child = new tabris.Button();

      child.appendTo(parent);
      tabris.Layout.flushQueue();

      expect(parent._flushLayout).toHaveBeenCalled();
    });

    it("is triggered by re-parenting a child", function() {
      var parent2 = new tabris.Composite();
      child = new tabris.Button().appendTo(parent);
      spyOn(parent, "_flushLayout");
      spyOn(parent2, "_flushLayout");

      child.appendTo(parent2);
      tabris.Layout.flushQueue();

      expect(parent._flushLayout).toHaveBeenCalled();
    });

    it("is triggered by disposing of a child", function() {
      child = new tabris.Button().appendTo(parent);
      spyOn(parent, "_flushLayout");

      child.dispose();
      tabris.Layout.flushQueue();

      expect(parent._flushLayout).toHaveBeenCalled();
    });

  });

  describe("native events:", function() {

    var listener, widget;

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

    beforeEach(function() {
      listener = jasmine.createSpy();
    });

    it("change:bounds", function() {
      widget = new tabris.CheckBox().on("change:bounds", listener);

      tabris._notify(widget.cid, "Resize", {bounds: [1, 2, 3, 4]});

      checkEvent({left: 1, top: 2, width: 3, height: 4});
      checkListen("Resize");
    });

    it("resize", function() {
      widget = new tabris.CheckBox().on("resize", listener);

      tabris._notify(widget.cid, "Resize", {bounds: [1, 2, 3, 4]});

      checkEvent({left: 1, top: 2, width: 3, height: 4});
      checkListen("Resize");
    });

  });

});

describe("tabris.registerWidget", function() {

  afterEach(function() {
    delete tabris.TestType;
  });

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

  it("adds custom properties", function() {
    tabris.registerWidget("TestType", {_properties: {foo: {type: "number"}}});

    expect(tabris.TestType._properties.foo).toBeDefined();
    expect(tabris.TestType._properties.foo.type.encode("23")).toBe(23);
  });

  it("adds default properties", function() {
    tabris.registerWidget("TestType", {});

    expect(tabris.TestType._properties.enabled).toBeDefined();
    expect(tabris.TestType._properties.visible).toBeDefined();
  });

  it("extends default properties", function() {
    var custom = {foo: "any", enabled: {type: "number"}};

    tabris.registerWidget("TestType", {_properties: custom});

    expect(tabris.TestType._properties.foo).toBeDefined();
    expect(tabris.TestType._properties.enabled.type.encode("23")).toBe(23);
  });

  it("creates a copy of default properties", function() {
    tabris.registerWidget("TestType", {_properties: {enabled: {type: "number"}}});
    delete tabris.TestType;
    tabris.registerWidget("TestType", {});

    expect(tabris.TestType._properties.enabled.type.encode("23")).toBe(true);
  });

  it("created widgets are instanceof Widget", function() {
    tabris.registerWidget("TestType", {});

    var instance = new tabris.TestType();

    expect(instance).toEqual(jasmine.any(tabris.Widget));
  });

});

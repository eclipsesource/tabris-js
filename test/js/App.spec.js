describe("App", function() {

  var app, nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._init(nativeBridge);
    app = tabris("_App");
  });

  it("is added to tabris object", function() {
    expect(tabris.app).toEqual(jasmine.any(tabris._App));
  });

  it("listens for Pause event", function() {
    var listener = jasmine.createSpy();

    app.on("pause", listener);

    var calls = nativeBridge.calls({id: "tabris.App", op: "listen", event: "Pause"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers pause event", function() {
    var listener = jasmine.createSpy();
    app.on("pause", listener);
    tabris._notify("tabris.App", "Pause");

    expect(listener).toHaveBeenCalled();
  });

  it("listens for Resume event", function() {
    var listener = jasmine.createSpy();

    app.on("resume", listener);

    var calls = nativeBridge.calls({id: "tabris.App", op: "listen", event: "Resume"});
    expect(calls[0].listen).toBe(true);
  });

  it("triggers resume event", function() {
    var listener = jasmine.createSpy();
    app.on("resume", listener);
    tabris._notify("tabris.App", "Resume");

    expect(listener).toHaveBeenCalled();
  });

  it("can not be disposed", function() {
    expect(function() {
      app.dispose();
    }).toThrow();
  });

});

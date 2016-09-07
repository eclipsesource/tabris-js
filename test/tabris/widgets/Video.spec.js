describe("Video", function() {

  var nativeBridge, video;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    video = new tabris.Video();
  });


  it("is created", function() {
    var calls = nativeBridge.calls({op: "create", type: "tabris.widgets.Video"});
    expect(calls.length).toBe(1);
  });


  it("does not SET read-only properties", function() {
    spyOn(console, "warn");
    video.set({
      speed: 2,
      position: 3,
      duration: 4,
      state: "play"
    });

    var calls = nativeBridge.calls({op: "set"});
    expect(calls.length).toBe(0);
  });

  describe("get", function() {

    it("returns initial default property values", function() {
      expect(video.get("url")).toBe("");
      expect(video.get("controlsVisible")).toBe(true);
      expect(video.get("autoPlay")).toBe(true);
    });

    it("GETs read-only properties", function() {
      spyOn(nativeBridge, "get").and.returnValue("native value");

      expect(video.get("speed")).toBe("native value");
      expect(video.get("position")).toBe("native value");
      expect(video.get("duration")).toBe("native value");
      expect(video.get("state")).toBe("native value");
    });

  });

  describe("change:state", function() {

    var listener;

    beforeEach(function() {
      listener = jasmine.createSpy();
      video.on("change:state", listener);
    });

    it("sends listen for statechange", function() {
      var listen = nativeBridge.calls({op: "listen", id: video.cid});
      expect(listen.length).toBe(1);
      expect(listen[0].event).toBe("statechange");
      expect(listen[0].listen).toBe(true);
    });

    it("is fired with parameters", function() {
      tabris._notify(video.cid, "statechange", {state: "play"});

      expect(listener.calls.count()).toBe(1);
      expect(listener.calls.argsFor(0)[0]).toBe(video);
      expect(listener.calls.argsFor(0)[1]).toEqual("play");
    });

  });

  it("pause() CALLs pause", function() {
    video.pause();

    var call = nativeBridge.calls({op: "call", id: video.cid});
    expect(call.length).toBe(1);
    expect(call[0].method).toBe("pause");
  });

  it("play() CALLs play with speed 1", function() {
    video.play();

    var call = nativeBridge.calls({op: "call", id: video.cid});
    expect(call.length).toBe(1);
    expect(call[0].method).toBe("play");
    expect(call[0].parameters.speed).toBe(1);
  });

  it("play(speed) CALLs play with given speed", function() {
    video.play(2);

    var call = nativeBridge.calls({op: "call", id: video.cid});
    expect(call.length).toBe(1);
    expect(call[0].method).toBe("play");
    expect(call[0].parameters.speed).toBe(2);
  });

  it("play with invalid parameter throws", function() {
    expect(function() {
      video.play("foo");
    }).toThrow();
  });

  it("seek CALLs seek", function() {
    video.seek(2000);

    var call = nativeBridge.calls({op: "call", id: video.cid});
    expect(call.length).toBe(1);
    expect(call[0].method).toBe("seek");
    expect(call[0].parameters.position).toBe(2000);
  });

  it("seek with invalid parameter to throw", function() {
    expect(function() {
      video.seek("foo");
    }).toThrow();
  });

});

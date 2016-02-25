describe("WebSocket", function() {

  var nativeBridge;
  var webSocket;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    spyOn(nativeBridge, "call");
    tabris._reset();
    tabris._init(nativeBridge);
    webSocket = new tabris.WebSocket("ws://url.com", "chat-protocol");
  });

  afterEach(function() {
    nativeBridge = null;
    webSocket = null;
  });

  describe("WebSocket", function() {

    it("is available on window", function() {
      expect(WebSocket).not.toBe(undefined);
    });

  });

  describe("WebSocket constructor", function() {

    it("is a function", function() {
      expect(typeof tabris.WebSocket).toBe("function");
    });

    it("declares 2 formal parameters", function() {
      expect(tabris.WebSocket.length).toBe(2);
    });

    it("fails when url parameter is omitted", function() {
      expect(() => new tabris.WebSocket())
        .toThrowError("The WebSocket url has to be of type string");
    });

    it("fails when url parameter is not string", function() {
      expect(() => new tabris.WebSocket(123))
        .toThrowError("The WebSocket url has to be of type string");
    });

    it("fails when scheme of url parameter is not 'ws' or 'wss'", function() {
      expect(() => new tabris.WebSocket("http://url.com"))
        .toThrowError("The WebSocket url has to have a scheme of 'ws' or 'wss' but is 'http'");
    });

    it("fails when protocol is omitted", function() {
      expect(() => new tabris.WebSocket("ws://url.com"))
        .toThrowError("The WebSocket protocol has too be a string or an array of strings");
    });

    it("fails when protocol is not string", function() {
      expect(() => new tabris.WebSocket("ws://url.com", 123))
        .toThrowError("The WebSocket protocol has too be a string or an array of strings");
    });

    it("creates WebSocket from url and protocol", function() {
      webSocket = new tabris.WebSocket("ws://url.com", "chat-protocol");

      expect(webSocket.url).toBe("ws://url.com");
      expect(webSocket.protocol).toBe(""); // empty string until 'open' has been called
    });

    it("creates WebSocket from url and array of protocols", function() {
      webSocket = new tabris.WebSocket("ws://url.com", ["chat-protocol", "communication-protocol"]);

      expect(webSocket.url).toBe("ws://url.com");
      expect(webSocket.protocol).toBe(""); // empty string until 'open' has been called
    });

  });

  describe("open event", function() {

    it("sets readyState to OPEN", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      expect(webSocket.readyState).toBe(webSocket.OPEN);
    });

    it("sets protocol to protocol parameter", function() {
      tabris._notify(webSocket._proxy.cid, "open", {protocol: "chat-protocol"});

      expect(webSocket.protocol).toBe("chat-protocol");
    });

    it("sets extensions to extensions parameter", function() {
      tabris._notify(webSocket._proxy.cid, "open", {extensions: "compress"});

      expect(webSocket.extensions).toBe("compress");
    });

    it("notifies onopen listener", function() {
      var listener = jasmine.createSpy();
      var parameter = {protocol: "chat-protocol", extensions: "compress"};
      webSocket.onopen = listener;

      tabris._notify(webSocket._proxy.cid, "open", parameter);

      expect(listener).toHaveBeenCalledWith(parameter);
    });

  });

  describe("message event", function() {

    it("notifies onmessage listener", function() {
      var listener = jasmine.createSpy();
      var parameter = {data: "message"};
      webSocket.onmessage = listener;
      tabris._notify(webSocket._proxy.cid, "open", parameter);

      tabris._notify(webSocket._proxy.cid, "message", parameter);

      expect(listener).toHaveBeenCalledWith(parameter);
    });

  });

  describe("close event", function() {

    it("sets readyState to CLOSED", function() {
      tabris._notify(webSocket._proxy.cid, "close", {});

      expect(webSocket.readyState).toBe(webSocket.CLOSED);
    });

    it("notifies onclose listener", function() {
      var listener = jasmine.createSpy();
      webSocket.onclose = listener;

      tabris._notify(webSocket._proxy.cid, "close", {});

      expect(listener).toHaveBeenCalledWith({});
    });

  });

  describe("error event", function() {

    it("sets readyState to CLOSED", function() {
      tabris._notify(webSocket._proxy.cid, "error", {});

      expect(webSocket.readyState).toBe(webSocket.CLOSED);
    });

    it("notifies onerror listener", function() {
      var listener = jasmine.createSpy();
      webSocket.onerror = listener;

      tabris._notify(webSocket._proxy.cid, "error", {});

      expect(listener).toHaveBeenCalledWith({});
    });

  });

  describe("bufferProcess event", function() {

    it("reduces amount of buffered data", function() {
      webSocket.bufferedAmount = 1000;
      tabris._notify(webSocket._proxy.cid, "bufferProcess", {byteLength: 100});

      expect(webSocket.bufferedAmount).toBe(900);
    });

  });

  describe("binaryType", function() {

    it("set calls setter", function() {
      webSocket.binaryType = "blob";

      expect(nativeBridge.calls({op: "set", id: webSocket._proxy.cid})[0].properties).toEqual({binaryType: "blob"});
    });

    it("get calls getter", function() {
      spyOn(nativeBridge, "get").and.returnValue("blob");

      expect(webSocket.binaryType).toBe("blob");
    });

  });

  describe("method send", function() {

    it("throws when readyState is CONNECTING", function() {
      expect(() => webSocket.send("hello"))
        .toThrowError("Can not 'send' WebSocket message when WebSocket state is CONNECTING");
    });

    it("throws when data is not string, typedarray or arraybuffer", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      expect(() => webSocket.send(123))
        .toThrowError("Data of type number is not supported in WebSocket 'send' operation");
    });

    it("calls 'send' with string data", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      webSocket.send("hello");

      expect(nativeBridge.call).toHaveBeenCalledWith(webSocket._proxy.cid, "send", {data: "hello"});
    });

    it("increases bufferedAmount by the number of utf-8 bytes in string data", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      webSocket.send("hello ä");

      expect(webSocket.bufferedAmount).toBe(8);
    });

    it("calls 'send' with typedarray data", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      webSocket.send(new Int8Array([1, 2, 3]));

      expect(nativeBridge.call).toHaveBeenCalledWith(webSocket._proxy.cid, "send", {data: new Int8Array([1, 2, 3])});
    });

    it("calls 'send' with arraybuffer data", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});
      var data = new Int8Array([1, 2, 3]).buffer;

      webSocket.send(data);

      expect(nativeBridge.call).toHaveBeenCalledWith(webSocket._proxy.cid, "send", {data: data});
    });

    it("increases bufferedAmount by the number of bytes in int8 array", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      webSocket.send(new Int8Array([1, 2, 3]));

      expect(webSocket.bufferedAmount).toBe(3);
    });

    it("increases bufferedAmount by the number of bytes in arraybuffer", function() {
      tabris._notify(webSocket._proxy.cid, "open", {});

      webSocket.send(new Int16Array([1, 2, 3]).buffer);

      expect(webSocket.bufferedAmount).toBe(6);
    });

  });

  describe("method close", function() {

    it("throws when code is not a number", function() {
      expect(() => webSocket.close("hello"))
        .toThrowError("A given close code has to be either 1000 or in the range 3000 - 4999 inclusive");
    });

    it("throws when code is below 3000 and not 1000", function() {
      expect(() => webSocket.close(2999))
        .toThrowError("A given close code has to be either 1000 or in the range 3000 - 4999 inclusive");
    });

    it("throws when code is larger than 4999", function() {
      expect(() => webSocket.close(5000))
        .toThrowError("A given close code has to be either 1000 or in the range 3000 - 4999 inclusive");
    });

    it("throws when reason string has more than 123 utf-8 bytes", function() {
      expect(() => webSocket.close(1000,
        "Longer reason messages are not allowed to reduce data usage " +
        "on bandwidth limited clients. Please use a shorter reason message."))
        .toThrowError("The close reason can not be larger than 123 utf-8 bytes");
    });

    it("sets readyState to CLOSING", function() {
      webSocket.close();

      expect(webSocket.readyState).toBe(webSocket.CLOSING);
    });

    it("does not call 'close' when readyState is CLOSING", function() {
      webSocket.readyState = webSocket.CLOSING;

      expect(nativeBridge.call).not.toHaveBeenCalled();
    });

    it("does not call 'close' when readyState is CLOSED", function() {
      webSocket.readyState = webSocket.OPEN;

      expect(nativeBridge.call).not.toHaveBeenCalled();
    });

    it("calls 'close' with code and reason", function() {
      webSocket.close(1000, "message");

      expect(nativeBridge.call).toHaveBeenCalledWith(webSocket._proxy.cid, "close", {code: 1000, reason: "message"});
    });
  });

});

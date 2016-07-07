describe("Crypto", function() {

  var nativeBridge;
  var crypto;
  var returnValue;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._init(nativeBridge);
    crypto = new tabris.Crypto();
    spyOn(nativeBridge, "call").and.callFake((id, method) => method === "getRandomValues" ? returnValue : null);
  });

  afterEach(function() {
    nativeBridge = null;
    crypto = null;
  });

  describe("getRandomValues", function() {

    it("fails with missing argument", function() {
      expect(() => crypto.getRandomValues())
        .toThrowError("Not enough arguments to Crypto.getRandomValues");
    });

    it("fails with null argument", function() {
      expect(() => crypto.getRandomValues(null))
        .toThrowError("Unsupported type in Crypto.getRandomValues");
    });

    it("fails with plain array", function() {
      expect(() => crypto.getRandomValues([0, 0, 0]))
        .toThrowError("Unsupported type in Crypto.getRandomValues");
    });

    it("fails with float typed array", function() {
      expect(() => crypto.getRandomValues(new Float32Array(3)))
        .toThrowError("Unsupported type in Crypto.getRandomValues");
    });

    it("fails when client returns wrong number of values", function() {
      returnValue = new Uint8Array([0, 1]);

      expect(() => crypto.getRandomValues(new Int8Array(3)))
        .toThrowError("Not enough random bytes available");
    });

    it("fills a given Int8Array", function() {
      var buffer = new Int8Array(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).toBe(0);
      expect(buffer[1]).toBe(1);
      expect(buffer[2]).toBe(-1);
    });

    it("fills a given Uint8Array", function() {
      var buffer = new Uint8Array(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).toBe(0);
      expect(buffer[1]).toBe(1);
      expect(buffer[2]).toBe(255);
    });

    it("fills a given Uint8ClampedArray", function() {
      var buffer = new Uint8ClampedArray(3);
      returnValue = new Uint8Array([0, 1, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer[0]).toBe(0);
      expect(buffer[1]).toBe(1);
      expect(buffer[2]).toBe(255);
    });

    it("fills a given Int16Arrray", function() {
      var buffer = new Int16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).toBe(6);
      expect(buffer[0]).toBe(0); // 0x0000
      expect(buffer[1]).toBe(256); // 0x0100
      expect(buffer[2]).toBe(-1); // 0xffff
    });

    it("fills a given Uint16Arrray", function() {
      var buffer = new Uint16Array(3);
      returnValue = new Uint8Array([0, 0, 0, 1, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).toBe(6);
      expect(buffer[0]).toBe(0); // 0x0000
      expect(buffer[1]).toBe(256); // 0x0100
      expect(buffer[2]).toBe(65535); // 0xffff
    });

    it("fills a given Int32Arrray", function() {
      var buffer = new Int32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).toBe(12);
      expect(buffer[0]).toBe(0);
      expect(buffer[1]).toBe(0x01000000);
      expect(buffer[2]).toBe(-1);
    });

    it("fills a given Uint32Arrray", function() {
      var buffer = new Uint32Array(3);
      returnValue = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 1, 255, 255, 255, 255]);

      crypto.getRandomValues(buffer);

      expect(buffer.byteLength).toBe(12);
      expect(buffer[0]).toBe(0);
      expect(buffer[1]).toBe(0x01000000);
      expect(buffer[2]).toBe(0xffffffff);
    });

  });

});

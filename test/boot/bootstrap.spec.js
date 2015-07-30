describe("bootstrap", function() {

  function fakeClient() {
    var client = new NativeBridgeSpy();
    // used by module system, return empty modules
    client.loadAndExecute = function() {
      return {executeResult: {exports: {}}};
    };
    // allow to specify client version using the client.version field in tests
    spyOn(client, "get").and.callFake(function(target, prop) {
      if (target === "tabris.App" && prop === "tabrisJsVersion") {
        return client.version;
      }
    });
    return client;
  }

  var client;

  beforeEach(function() {
    client = fakeClient();
    tabris.trigger = function() {};
    spyOn(console, "error");
    spyOn(console, "warn");
  });

  describe("version check", function() {

    it("accepts same versions", function() {
      client.version = "1.2.3";
      tabris.version = "1.2.3";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it("ignores smaller tabris patch version", function() {
      client.version = "1.2.3";
      tabris.version = "1.2.2";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it("ignores greater tabris patch version", function() {
      client.version = "1.2.3";
      tabris.version = "1.2.4";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it("ignores smaller tabris minor version", function() {
      client.version = "1.2.3";
      tabris.version = "1.1.0";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it("raises warning for greater tabris minor version", function() {
      client.version = "1.2.3";
      tabris.version = "1.3.0";

      tabris._start(client);

      expect(console.warn).toHaveBeenCalledWith('Version mismatch: JavaScript module "tabris" ' +
        "(version 1.3.0) is newer than the native tabris platform. " +
        "Supported module versions: 1.0 to 1.2.");
      expect(console.error).not.toHaveBeenCalled();
    });

    it("raises error for smaller tabris major version", function() {
      client.version = "2.2.3";
      tabris.version = "1.2.3";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Version mismatch: JavaScript module "tabris" ' +
        "(version 1.2.3) is incompatible with the native tabris platform. " +
        "Supported module versions: 2.0 to 2.2.");
    });

    it("raises error for greater tabris major version", function() {
      client.version = "1.2.3";
      tabris.version = "2.1.0";

      tabris._start(client);

      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Version mismatch: JavaScript module "tabris" ' +
        "(version 2.1.0) is incompatible with the native tabris platform. " +
        "Supported module versions: 1.0 to 1.2.");
    });

  });

});

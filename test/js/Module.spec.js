/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("tabris.Module", function() {

  var nativeBridge, global;

  var respond = function(response) {
    nativeBridge.load.and.returnValue(response);
  };

  beforeEach(function() {
    global = {};
    nativeBridge = new NativeBridgeSpy();
    tabris._start(nativeBridge);
    tabris.Module.installRequire(global);
    nativeBridge.load = jasmine.createSpy();
  });

  describe("constructor", function() {

    it("sets id and parent", function() {
      var parent = new tabris.Module("bar");
      var module = new tabris.Module("foo", parent);

      expect(module.id).toBe("foo");
      expect(module.parent).toBe(parent);
    });

    it("sets initial values", function() {
      var module = new tabris.Module("foo");

      expect(module.children).toEqual([]);
      expect(module.exports).toEqual({});
      expect(module.filename).toBeNull();
    });

    it("adds itself to parent children", function() {
      var parent = new tabris.Module("bar");
      var module = new tabris.Module("foo", parent);

      expect(parent.children).toEqual([module]);
    });

  });

  describe("instance", function() {

    var module;

    // TODO: circular dependency / module.loaded

    describe("._load", function() {

      beforeEach(function() {
        module = new tabris.Module("./foo/bar", global);
      });

      it("loads js for given path", function() {
        respond("var someValidCode = 1;");

        module._load();

        expect(nativeBridge.load).toHaveBeenCalledWith("./foo/bar.js");
        expect(nativeBridge.load.calls.count()).toBe(1);
      });

      it("loads /package.json for given path", function() {
        nativeBridge.load.and.callFake(function(src) {
          if (src === "./foo/bar/package.json") {
            return '{"main": "mylib.js"}';
          }
          if (src === "./foo/bar/mylib.js") {
            return "module.exports = 'success'";
          }
        });

        module._load();

        expect(nativeBridge.load).toHaveBeenCalledWith("./foo/bar.js");
        expect(nativeBridge.load).toHaveBeenCalledWith("./foo/bar/package.json");
        expect(nativeBridge.load).toHaveBeenCalledWith("./foo/bar/mylib.js");
        expect(module.exports).toBe("success");
      });

      it("sets filename", function() {
        respond("var someValidCode = 1;");

        module._load();

        expect(module.filename).toBe("./foo/bar.js");
      });

      it("throws exception if no source is returned by load", function() {
        expect(function() {
          module._load();
        }).toThrow(new Error("Cannot find module './foo/bar'"));
      });

      it("exposes module locally", function() {
        respond("module.exports = 1;");

        module._load();

        expect(module.exports).toBe(1);
        expect(window.module).toBeUndefined();
      });

      it("exposes module.exports locally", function() {
        respond("exports.x = 1;");

        module._load();

        expect(module.exports.x).toBe(1);
        expect(window.exports).toBeUndefined();
      });

      it("exposes module.require locally", function() {
        respond("module.exports = require; require('foo');");
        module.require = jasmine.createSpy();

        module._load();

        expect(module.require).toHaveBeenCalledWith("foo");
        expect(module.require.calls.first().object).toBe(module); // ensure 'this' is the module
        expect(window.require).not.toBe(module.exports);
      });

      it("does not run js in global scope", function() {
        respond("var x = 1");

        module._load();

        expect(window.x).toBeUndefined();
      });

    });

    describe(".require", function() {

      beforeEach(function() {
        respond("module.exports = module;");
        module = global.require("./foo/bar");
      });

      it("sets module as parent for new module instance", function() {
        var module2 = module.require("./foo/bar2");
        expect(module2.parent).toBe(module);
      });

      it("keeps parent for cached module instance", function() {
        var module2 = global.require("bar2");

        var module2Cached = module.require("bar2");

        expect(module2).toBe(module2Cached);
        expect(module2.parent).toBe(global);
      });

      it("uses parent path as root for sub directories", function() {
        var fooBar2 = global.require("./foo/bar2");

        var result = module.require("./bar2");

        expect(result.id).toBe("./foo/bar2");
        expect(result).toBe(fooBar2);
        expect(result).not.toBe(global.require("./bar2"));
      });

      it("uses parent path as root for parent directories", function() {
        var bar2 = global.require("./bar2");

        var result = module.require("../bar2");

        expect(result.id).toBe("./bar2");
        expect(result).toBe(bar2);
      });

      it("uses parent path as root for cousin directory", function() {
        var someOtherDir = global.require("./some/other/dir");

        var result = someOtherDir.require("../../foo/bar");

        expect(result).toBe(module);
      });

      it("does not use parent path for non-relative module", function() {
        var bar2 = global.require("bar2");

        var result = module.require("bar2");

        expect(result.id).toBe("./node_modules/bar2");
        expect(result).toBe(bar2);
      });

    });

  });

  describe("global require", function() {

    beforeEach(function() {
      respond("module.exports = module;");
    });

    it("creates module for relative id", function() {
      expect(global.require("./foo").id).toBe("./foo");
    });

    it("throws exception for module in parent directory", function() {
      expect(function() {
        global.require("../foo");
      }).toThrow();
    });

    it("creates module with non-relative id", function() {
      expect(global.require("foo").id).toBe("./node_modules/foo");
    });

    it("creates module with global as parent", function() {
      expect(global.require("./foo").parent).toBe(global);
    });

    it("returns different exports for different modules", function() {
      expect(global.require("./foo")).not.toBe(global.require("./bar"));
    });

    it("returns same exports for same path", function() {
      expect(global.require("./foo")).toBe(global.require("./foo"));
    });

    it("returns same exports for different paths to the same module", function() {
      expect(global.require("foo")).toBe(global.require("./node_modules/foo"));
    });

  });

});

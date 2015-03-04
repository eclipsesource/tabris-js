describe("tabris.Module", function() {

  var nativeBridge;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._client = nativeBridge;
    spyOn(nativeBridge, "load");
    spyOn(tabris.Module, "createLoader").and.returnValue(function(module) {
      module.exports = module;
    });
  });

  describe("constructor", function() {

    it("sets id and parent from arguments", function() {
      var parent = new tabris.Module("bar");
      var module = new tabris.Module("foo", parent);

      expect(module.id).toBe("foo");
      expect(module.parent).toBe(parent);
    });

    it("without arguments sets default values", function() {
      var module = new tabris.Module();

      expect(module.id).toBeNull();
      expect(module.parent).toBeNull();
      expect(module.exports).toEqual({});
    });

    it("sets initial values", function() {
      var module = new tabris.Module("foo");

      expect(module.exports).toEqual({});
    });

    it("runs loader with parameters", function() {
      var loader = jasmine.createSpy().and.callFake(function(module, exports) {
        exports.foo = "bar";
      });
      var module = new tabris.Module("foo", null, loader);

      expect(loader).toHaveBeenCalledWith(module, module.exports, jasmine.any(Function));
      expect(module.exports).toEqual({foo: "bar"});
    });

  });

  describe("instance", function() {

    var module;

    beforeEach(function() {
      module = new tabris.Module();
    });

    describe("require", function() {

      it("returns exports", function() {
        tabris.Module.createLoader.and.returnValue(function(module, exports) {
          exports.bar = 1;
        });

        var foo = module.require("./foo");

        expect(foo.bar).toBe(1);
      });

      it("returns same exports for subsequent calls", function() {
        var exports1 = module.require("./foo");
        var exports2 = module.require("./foo");

        expect(exports1).toBe(exports2);
      });

      it("returns module that is currently loading", function() {
        tabris.Module.createLoader.and.returnValue(function(module, exports) {
          exports.foo = 1;
          module.require("./foo").bar = 2;
        });

        expect(module.require("./foo")).toEqual({foo: 1, bar: 2});
      });

      it("returns native module", function() {
        var native = new tabris.Module("native", module, {});

        expect(module.require("native")).toBe(native.exports);
      });

      it("returns same exports from different modules", function() {
        tabris.Module.createLoader.and.returnValue(function(module, exports) {
          exports.bar = 1;
        });
        var module1 = new tabris.Module("./module1", module);
        var module2 = new tabris.Module("./module2", module);

        var export1 = module1.require("./foo");
        var export2 = module2.require("./foo");

        expect(export1).toEqual({bar: 1});
        expect(export1).toBe(export2);
      });

      it("requests url only once", function() {
        module.require("./foo");
        module.require("./foo");

        expect(tabris.Module.createLoader.calls.count()).toBe(1);
      });

      it("requests loader with request as path", function() {
        module.require("./bar");

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./bar");
      });

      it("requests alternate file name .js", function() {
        tabris.Module.createLoader.and.callFake(function(path) {
          if (path === "./foo.js") {
            return function(module) {module.exports = module;};
          }
        });

        var foo = module.require("./foo");

        expect(foo.id).toBe("./foo.js");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo.js");
      });

      it("requests alternate file name .json", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue({data: "bar"});

        var foo = module.require("./foo");

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo.js");
        expect(foo).toEqual({data: "bar"});
      });

      it("requests file specified in /package.json", function() {
        spyOn(tabris.Module, "readJSON").and.callFake(function(url) {
          if (url === "./foo/package.json") {
            return {main: "bar"};
          }
        });
        tabris.Module.createLoader.and.callFake(function(url) {
          if (url === "./foo/bar") {
            return function(module) {
              module.exports = module;
            };
          }
        });

        var foo = module.require("./foo");

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo.json");
        expect(foo.id).toBe("./foo/bar");
      });

      it("requests alternate file name /index.js", function() {
        spyOn(tabris.Module, "readJSON");
        tabris.Module.createLoader.and.callFake(function(path) {
          if (path === "./foo/index.js") {
            return function(module) {module.exports = module;};
          }
        });

        var foo = module.require("./foo");

        expect(foo.id).toBe("./foo/index.js");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/package.json");
      });

      it("requests alternate file name /index.json", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.callFake(function(url) {
          if (url === "./foo/index.json") {
            return {data: "bar"};
          }
        });

        var foo = module.require("./foo");

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo/index.js");
        expect(foo).toEqual({data: "bar"});
      });

      it("requests alternate file name for folders", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);

        try {
          module.require("./foo/");
        } catch (error) {
        }

        expect(tabris.Module.createLoader).not.toHaveBeenCalledWith("./foo");
        expect(tabris.Module.createLoader).not.toHaveBeenCalledWith("./foo.js");
        expect(tabris.Module.readJSON).not.toHaveBeenCalledWith("./foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo/index.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/index.json");
      });

      it("requests module from node_modules folder", function() {
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);
        tabris.Module.createLoader.and.callFake(function(path) {
          if (path === "./node_modules/foo/index.js") {
            return function() {};
          }
        });

        module.require("foo");

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo/index.js");
      });

      it("fails to requests module from node_modules folder with error", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);

        expect(function() {
          module.require("foo");
        }).toThrow(new Error("Cannot find module 'foo'"));

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo/index.js");
      });

      it("requests modules from node_modules folder at top-level", function() {
        module = new tabris.Module("./foo/script.js");
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);

        try {
          module.require("bar");
        } catch (error) {
        }

        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/node_modules/bar/package.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/bar/package.json");
      });

      it("does not requests modules node_modules/node_modules folder", function() {
        module = new tabris.Module("./node_modules/foo/script.js");
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);

        try {
          module.require("bar");
        } catch (error) {
        }

        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo/node_modules/bar/package.json");
        expect(tabris.Module.readJSON).not.toHaveBeenCalledWith("./node_modules/node_modules/bar/package.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/bar/package.json");
      });

      it("does not request module from node_modules folder at top-level", function() {
        module = new tabris.Module("./foo/script.js");
        tabris.Module.createLoader.and.callFake(function(path) {
          if (path === "./foo/node_modules/bar/script2.js") {
            return function(module) {module.exports = 2;};
          }
        });
        spyOn(tabris.Module, "readJSON").and.callFake(function(path) {
          if (path === "./foo/node_modules/bar/package.json") {
            return {main: "script2.js"};
          }
        });

        expect(module.require("bar")).toBe(2);

        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./foo/node_modules/bar/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./foo/node_modules/bar/script2.js");
        expect(tabris.Module.readJSON).not.toHaveBeenCalledWith("./node_modules/bar/package.json");
      });

      it("fails if module cannot be found", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue(undefined);

        expect(function() {
          module.require("foo");
        }).toThrow();

        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo.js");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo.json");
        expect(tabris.Module.readJSON).toHaveBeenCalledWith("./node_modules/foo/package.json");
        expect(tabris.Module.createLoader).toHaveBeenCalledWith("./node_modules/foo/index.js");
      });

      it("requests url variants only once", function() {
        tabris.Module.createLoader.and.returnValue(undefined);
        spyOn(tabris.Module, "readJSON").and.returnValue({});

        module.require("./foo");
        tabris.Module.createLoader.calls.reset();
        tabris.Module.readJSON.calls.reset();
        module.require("./foo");

        expect(tabris.Module.createLoader.calls.count()).toBe(0);
        expect(tabris.Module.readJSON.calls.count()).toBe(0);
      });

      it("supports loading a package.json directly", function() {
        spyOn(tabris.Module, "readJSON").and.callFake(function(path) {
          if (path === "./node_modules/foo/package.json") {
            return {main: "foo.js"};
          }
        });

        var exports = module.require("./node_modules/foo/package.json");

        expect(exports).toEqual({main: "foo.js"});
      });

      it("caches node modules", function() {
        spyOn(tabris.Module, "readJSON").and.callFake(function(url) {
          if (url === "./foo/package.json") {
            return {main: "foo.js"};
          }
        });
        tabris.Module.createLoader.and.callFake(function(url) {
          if (url === "./foo/foo.js") {
            return function(module) {
              module.exports = module;
            };
          }
        });

        var foo1 = module.require("./foo");
        tabris.Module.createLoader.calls.reset();
        tabris.Module.readJSON.calls.reset();
        var foo2 = module.require("./foo");

        expect(tabris.Module.createLoader).not.toHaveBeenCalled();
        expect(tabris.Module.readJSON).not.toHaveBeenCalled();
        expect(foo1).toBe(foo2);
      });

      it("supports node modules loading each other", function() {
        spyOn(tabris.Module, "readJSON").and.callFake(function(path) {
          if (path === "./node_modules/foo/package.json") {
            return {main: "foo.js"};
          }
          if (path === "./node_modules/bar/package.json") {
            return {main: "bar.js"};
          }
        });
        tabris.Module.createLoader.and.callFake(function(path) {
          if (path === "./node_modules/foo/foo.js") {
            return function(module) {
              module.exports.x = 1;
              module.exports.y = module.require("bar");
            };
          }
          if (path === "./node_modules/bar/bar.js") {
            return function(module) {
              module.exports = module.require("foo").x + 1;
            };
          }
        });

        var exports = module.require("foo");

        expect(exports).toEqual({x: 1, y: 2});
      });

      describe("from plain module", function() {

        it("creates module with id", function() {
          var result = module.require("./bar");

          expect(result.id).toBe("./bar");
        });

        it("creates module with nested id", function() {
          var result = module.require("./bar/baz");

          expect(result.id).toBe("./bar/baz");
        });

        it("fails if requested id is outside of module root", function() {
          expect(function() {
            module.require("../bar");
          }).toThrow();
        });

      });

      describe("from nested module", function() {

        beforeEach(function() {
          module.id = "./foo/bar.js";
        });

        it("creates module with plain id", function() {
          var result = module.require("./baz");

          expect(result.id).toBe("./foo/baz");
        });

        it("during module loading creates module with plain id", function() {
          tabris.Module.createLoader.and.callFake(function(path) {
            if (path === "./foo/baz.js") {
              return function(module, exports, require) {
                module.exports = require("./foo");
              };
            }
            if (path === "./foo/foo.js") {
              return function(module) {module.exports = module;};
            }
          });

          var result = module.require("./baz");

          expect(result.id).toBe("./foo/foo.js");
        });

        it("handles path that starts with '../'", function() {
          var result = module.require("../baz");

          expect(result.id).toBe("./baz");
        });

        it("handles nested path that starts with '../'", function() {
          var result = module.require("../bar/baz");

          expect(result.id).toBe("./bar/baz");
        });

        it("handles path with enclosed '/../'", function() {
          var result = module.require("./bar/../baz");

          expect(result.id).toBe("./foo/baz");
        });

        it("handles path with enclosed '/./'", function() {
          var result = module.require("./bar/./baz");

          expect(result.id).toBe("./foo/bar/baz");
        });

        it("handles path with multiple enclosed '/./' and '/../'", function() {
          var result = module.require("././bar/.././baz");

          expect(result.id).toBe("./foo/baz");
        });

      });

    });

  });

});

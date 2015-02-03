describe("util", function() {

  describe("extend", function() {

    it("copies properties of all source objects into target object", function() {
      var target = {a: 1, b: 1};

      util.extend(target, {b: 2, c: 2}, {c: 3});

      expect(target).toEqual({a: 1, b: 2, c: 3});
    });

    it("returns target object", function() {
      var object = {};

      var result = util.extend(object, {a: 1});

      expect(result).toBe(object);
    });

  });

  describe("pick", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = util.pick(original, ["a"]);

      expect(result).not.toBe(original);
    });

    it("copies all properties that are in the list", function() {
      var result = util.pick({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).toEqual({a: 1, c: 3});
    });

  });

  describe("omit", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = util.omit(original, ["b"]);

      expect(result).not.toBe(original);
    });

    it("copies all properties that are not in the list", function() {
      var result = util.omit({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).toEqual({b: 2});
    });

  });

  describe("clone", function() {

    it("returns a copy of object", function() {
      var original = {a: 1};

      var result = util.clone(original);

      expect(result).not.toBe(original);
    });

    it("copies all properties", function() {
      var result = util.clone({a: 1, b: 2});

      expect(result).toEqual({a: 1, b: 2});
    });

  });

  describe("invert", function() {

    it("inverts object with string values", function() {
      var result = util.invert({Moe: "Moses", Larry: "Louis", Curly: "Jerome"});
      expect(result).toEqual({Moses: "Moe", Louis: "Larry", Jerome: "Curly"});
    });

  });

  describe("rename", function() {

    it("renames keys on resulting object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      var result = util.rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(result).toEqual({foo4: "bar1", foo5: "bar2", foo3: "bar3"});
    });

    it("does not modify existing object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      util.rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(original).toEqual({foo1: "bar1", foo2: "bar2", foo3: "bar3"});
    });

  });

  describe("bind", function() {

    it("returns a wrapper that will be called with context", function() {
      var fn = function() { return this; };
      var obj = {};

      var wrapper = util.bind(fn, obj);

      expect(wrapper()).toBe(obj);
    });

    it("wrapper receives arguments", function() {
      var fn = jasmine.createSpy();

      var wrapper = util.bind(fn, {});
      wrapper(23, 42);

      expect(fn).toHaveBeenCalledWith(23, 42);
    });

  });

  describe("extendPrototype", function() {

    var Class1, Class2;

    beforeEach(function() {
      Class1 = function() {};
      Class2 = function() {};
    });

    it("returns object with source function prototype as prototype", function() {
      Class1.prototype = {a: 1};
      var object = util.extendPrototype(Class1, {});

      expect(object.a).toBe(1);
      expect(object.hasOwnProperty("a")).toBeFalsy();
    });

    it("returns object with target object properties", function() {
      var object = util.extendPrototype(function() {}, {a: 1});

      expect(object.a).toBe(1);
      expect(object.hasOwnProperty("a")).toBeTruthy();
    });

    it("works with instanceof", function() {

      Class2.prototype = util.extendPrototype(Class1, {});
      var object = new Class2();

      expect(object instanceof Class2).toBeTruthy();
      expect(object instanceof Class1).toBeTruthy();
    });

    describe("adds super function that", function() {
      it("calls overwritten methods", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = util.extendPrototype(Class1, {
          myFunction: function() {
            this.super("myFunction");
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).toHaveBeenCalled();
      });

      it("calls overwritten methods with arguments", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = util.extendPrototype(Class1, {
          myFunction: function() {
            this.super("myFunction", 1, 2, 3);
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).toHaveBeenCalledWith(1, 2, 3);
      });

      it("calls overwritten methods with context", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = util.extendPrototype(Class1, {
          myFunction: function() {
            this.super("myFunction");
          }
        });
        var instance = new Class2();
        instance.myFunction();
        expect(Class1.prototype.myFunction.calls.all()[0].object).toBe(instance);
      });

      it("returns the overwritten method's return value", function() {
        Class1.prototype.myFunction = function() {
          return 23;
        };

        Class2.prototype = util.extendPrototype(Class1, {
          myFunction: function() {
            return this.super("myFunction") + 1;
          }
        });
        var instance = new Class2();
        var result = instance.myFunction();
        expect(result).toBe(24);
      });
    });

  });

});

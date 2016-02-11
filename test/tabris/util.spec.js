describe("util", function() {

  describe("extend", function() {

    it("copies properties of all source objects into target object", function() {
      var target = {a: 1, b: 1};

      _.extend(target, {b: 2, c: 2}, {c: 3});

      expect(target).toEqual({a: 1, b: 2, c: 3});
    });

    it("returns target object", function() {
      var object = {};

      var result = _.extend(object, {a: 1});

      expect(result).toBe(object);
    });

  });

  describe("pick", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = _.pick(original, ["a"]);

      expect(result).not.toBe(original);
    });

    it("copies all properties that are in the list", function() {
      var result = _.pick({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).toEqual({a: 1, c: 3});
    });

  });

  describe("omit", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = _.omit(original, ["b"]);

      expect(result).not.toBe(original);
    });

    it("copies all properties that are not in the list", function() {
      var result = _.omit({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).toEqual({b: 2});
    });

  });

  describe("drop", function() {

    it("returns copy, does not modify original", function() {
      var original = [0, 1, 2, 3, 4];

      var result = _.drop(original);

      expect(result).not.toBe(original);
      expect(original).toEqual([0, 1, 2, 3, 4]);
    });

    it("skips the first element without parameter", function() {
      var result = _.drop([0, 1, 2, 3, 4]);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("returns copy with parameter 0", function() {
      var result = _.drop([0, 1, 2, 3, 4], 0);

      expect(result).toEqual([0, 1, 2, 3, 4]);
    });

    it("skips n elements with parameter n", function() {
      var result = _.drop([0, 1, 2, 3, 4], 2);

      expect(result).toEqual([2, 3, 4]);
    });

    it("supports negative parameter", function() {
      var result = _.drop([0, 1, 2, 3, 4], -2);

      expect(result).toEqual([3, 4]);
    });

  });

  describe("clone", function() {

    it("returns a copy of object", function() {
      var original = {a: 1};

      var result = _.clone(original);

      expect(result).not.toBe(original);
    });

    it("copies all properties", function() {
      var result = _.clone({a: 1, b: 2});

      expect(result).toEqual({a: 1, b: 2});
    });

  });

  describe("invert", function() {

    it("inverts object with string values", function() {
      var result = _.invert({Moe: "Moses", Larry: "Louis", Curly: "Jerome"});
      expect(result).toEqual({Moses: "Moe", Louis: "Larry", Jerome: "Curly"});
    });

  });

  describe("rename", function() {

    it("renames keys on resulting object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      var result = _.rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(result).toEqual({foo4: "bar1", foo5: "bar2", foo3: "bar3"});
    });

    it("does not modify existing object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      _.rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(original).toEqual({foo1: "bar1", foo2: "bar2", foo3: "bar3"});
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
      var object = _.extendPrototype(Class1, {});

      expect(object.a).toBe(1);
      expect(object.hasOwnProperty("a")).toBeFalsy();
    });

    it("returns object with target object properties", function() {
      var object = _.extendPrototype(function() {}, {a: 1});

      expect(object.a).toBe(1);
      expect(object.hasOwnProperty("a")).toBeTruthy();
    });

    it("works with instanceof", function() {

      Class2.prototype = _.extendPrototype(Class1, {});
      var object = new Class2();

      expect(object instanceof Class2).toBeTruthy();
      expect(object instanceof Class1).toBeTruthy();
    });

    describe("adds _super function that", function() {

      it("calls overwritten methods", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = _.extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction");
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).toHaveBeenCalled();
      });

      it("calls overwritten methods with arguments", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = _.extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction", [1, 2, 3]);
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).toHaveBeenCalledWith(1, 2, 3);
      });

      it("calls overwritten methods with context", function() {
        Class1.prototype.myFunction = jasmine.createSpy();

        Class2.prototype = _.extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction");
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

        Class2.prototype = _.extendPrototype(Class1, {
          myFunction: function() {
            return this._super("myFunction") + 1;
          }
        });
        var instance = new Class2();
        var result = instance.myFunction();
        expect(result).toBe(24);
      });

    });

  });

});

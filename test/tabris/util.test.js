import {expect, spy, restore} from "../test";
import {extend, pick, drop, omit, clone, invert, rename, extendPrototype} from "../../src/tabris/util";

describe("util", function() {

  afterEach(restore);

  describe("extend", function() {

    it("copies properties of all source objects into target object", function() {
      var target = {a: 1, b: 1};

      extend(target, {b: 2, c: 2}, {c: 3});

      expect(target).to.eql({a: 1, b: 2, c: 3});
    });

    it("returns target object", function() {
      var object = {};

      var result = extend(object, {a: 1});

      expect(result).to.equal(object);
    });

  });

  describe("pick", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = pick(original, ["a"]);

      expect(result).not.to.equal(original);
    });

    it("copies all properties that are in the list", function() {
      var result = pick({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).to.eql({a: 1, c: 3});
    });

  });

  describe("omit", function() {

    it("returns a copy", function() {
      var original = {a: 1};

      var result = omit(original, ["b"]);

      expect(result).not.to.equal(original);
    });

    it("copies all properties that are not in the list", function() {
      var result = omit({a: 1, b: 2, c: 3}, ["a", "c", "x"]);

      expect(result).to.eql({b: 2});
    });

  });

  describe("drop", function() {

    it("returns copy, does not modify original", function() {
      var original = [0, 1, 2, 3, 4];

      var result = drop(original);

      expect(result).not.to.equal(original);
      expect(original).to.eql([0, 1, 2, 3, 4]);
    });

    it("skips the first element without parameter", function() {
      var result = drop([0, 1, 2, 3, 4]);

      expect(result).to.eql([1, 2, 3, 4]);
    });

    it("returns copy with parameter 0", function() {
      var result = drop([0, 1, 2, 3, 4], 0);

      expect(result).to.eql([0, 1, 2, 3, 4]);
    });

    it("skips n elements with parameter n", function() {
      var result = drop([0, 1, 2, 3, 4], 2);

      expect(result).to.eql([2, 3, 4]);
    });

    it("supports negative parameter", function() {
      var result = drop([0, 1, 2, 3, 4], -2);

      expect(result).to.eql([3, 4]);
    });

  });

  describe("clone", function() {

    it("returns a copy of object", function() {
      var original = {a: 1};

      var result = clone(original);

      expect(result).not.to.equal(original);
    });

    it("copies all properties", function() {
      var result = clone({a: 1, b: 2});

      expect(result).to.eql({a: 1, b: 2});
    });

  });

  describe("invert", function() {

    it("inverts object with string values", function() {
      var result = invert({Moe: "Moses", Larry: "Louis", Curly: "Jerome"});
      expect(result).to.eql({Moses: "Moe", Louis: "Larry", Jerome: "Curly"});
    });

  });

  describe("rename", function() {

    it("renames keys on resulting object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      var result = rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(result).to.eql({foo4: "bar1", foo5: "bar2", foo3: "bar3"});
    });

    it("does not modify existing object", function() {
      var original = {foo1: "bar1", foo2: "bar2", foo3: "bar3"};
      rename(original, {foo1: "foo4", foo2: "foo5", foox: "fooy"});
      expect(original).to.eql({foo1: "bar1", foo2: "bar2", foo3: "bar3"});
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
      var object = extendPrototype(Class1, {});

      expect(object.a).to.equal(1);
      expect(object.hasOwnProperty("a")).to.be.not.ok;
    });

    it("returns object with target object properties", function() {
      var object = extendPrototype(function() {}, {a: 1});

      expect(object.a).to.equal(1);
      expect(object.hasOwnProperty("a")).to.be.ok;
    });

    it("works with instanceof", function() {

      Class2.prototype = extendPrototype(Class1, {});
      var object = new Class2();

      expect(object instanceof Class2).to.be.ok;
      expect(object instanceof Class1).to.be.ok;
    });

    describe("adds _super function that", function() {

      it("calls overwritten methods", function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction");
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).to.have.been.called;
      });

      it("calls overwritten methods with arguments", function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction", [1, 2, 3]);
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).to.have.been.calledWith(1, 2, 3);
      });

      it("calls overwritten methods with context", function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction: function() {
            this._super("myFunction");
          }
        });
        var instance = new Class2();
        instance.myFunction();

        expect(Class1.prototype.myFunction).to.have.been.calledOn(instance);
      });

      it("returns the overwritten method's return value", function() {
        Class1.prototype.myFunction = function() {
          return 23;
        };

        Class2.prototype = extendPrototype(Class1, {
          myFunction: function() {
            return this._super("myFunction") + 1;
          }
        });
        var instance = new Class2();
        var result = instance.myFunction();
        expect(result).to.equal(24);
      });

    });

  });

});

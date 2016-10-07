import {expect, spy, restore} from '../test';
import {extend, pick, drop, omit, clone, invert, rename, extendPrototype} from '../../src/tabris/util';

describe('util', function() {

  afterEach(restore);

  describe('extend', function() {

    it('copies properties of all source objects into target object', function() {
      let target = {a: 1, b: 1};

      extend(target, {b: 2, c: 2}, {c: 3});

      expect(target).to.eql({a: 1, b: 2, c: 3});
    });

    it('returns target object', function() {
      let object = {};

      let result = extend(object, {a: 1});

      expect(result).to.equal(object);
    });

  });

  describe('pick', function() {

    it('returns a copy', function() {
      let original = {a: 1};

      let result = pick(original, ['a']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are in the list', function() {
      let result = pick({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

      expect(result).to.eql({a: 1, c: 3});
    });

  });

  describe('omit', function() {

    it('returns a copy', function() {
      let original = {a: 1};

      let result = omit(original, ['b']);

      expect(result).not.to.equal(original);
    });

    it('copies all properties that are not in the list', function() {
      let result = omit({a: 1, b: 2, c: 3}, ['a', 'c', 'x']);

      expect(result).to.eql({b: 2});
    });

  });

  describe('drop', function() {

    it('returns copy, does not modify original', function() {
      let original = [0, 1, 2, 3, 4];

      let result = drop(original);

      expect(result).not.to.equal(original);
      expect(original).to.eql([0, 1, 2, 3, 4]);
    });

    it('skips the first element without parameter', function() {
      let result = drop([0, 1, 2, 3, 4]);

      expect(result).to.eql([1, 2, 3, 4]);
    });

    it('returns copy with parameter 0', function() {
      let result = drop([0, 1, 2, 3, 4], 0);

      expect(result).to.eql([0, 1, 2, 3, 4]);
    });

    it('skips n elements with parameter n', function() {
      let result = drop([0, 1, 2, 3, 4], 2);

      expect(result).to.eql([2, 3, 4]);
    });

    it('supports negative parameter', function() {
      let result = drop([0, 1, 2, 3, 4], -2);

      expect(result).to.eql([3, 4]);
    });

  });

  describe('clone', function() {

    it('returns a copy of object', function() {
      let original = {a: 1};

      let result = clone(original);

      expect(result).not.to.equal(original);
    });

    it('copies all properties', function() {
      let result = clone({a: 1, b: 2});

      expect(result).to.eql({a: 1, b: 2});
    });

  });

  describe('invert', function() {

    it('inverts object with string values', function() {
      let result = invert({Moe: 'Moses', Larry: 'Louis', Curly: 'Jerome'});
      expect(result).to.eql({Moses: 'Moe', Louis: 'Larry', Jerome: 'Curly'});
    });

  });

  describe('rename', function() {

    it('renames keys on resulting object', function() {
      let original = {foo1: 'bar1', foo2: 'bar2', foo3: 'bar3'};
      let result = rename(original, {foo1: 'foo4', foo2: 'foo5', foox: 'fooy'});
      expect(result).to.eql({foo4: 'bar1', foo5: 'bar2', foo3: 'bar3'});
    });

    it('does not modify existing object', function() {
      let original = {foo1: 'bar1', foo2: 'bar2', foo3: 'bar3'};
      rename(original, {foo1: 'foo4', foo2: 'foo5', foox: 'fooy'});
      expect(original).to.eql({foo1: 'bar1', foo2: 'bar2', foo3: 'bar3'});
    });

  });

  describe('extendPrototype', function() {

    let Class1, Class2;

    beforeEach(function() {
      Class1 = function() {};
      Class2 = function() {};
    });

    it('returns object with source function prototype as prototype', function() {
      Class1.prototype = {a: 1};
      let object = extendPrototype(Class1, {});

      expect(object.a).to.equal(1);
      expect(object.hasOwnProperty('a')).to.be.not.ok;
    });

    it('returns object with target object properties', function() {
      let object = extendPrototype(function() {}, {a: 1});

      expect(object.a).to.equal(1);
      expect(object.hasOwnProperty('a')).to.be.ok;
    });

    it('works with instanceof', function() {

      Class2.prototype = extendPrototype(Class1, {});
      let object = new Class2();

      expect(object instanceof Class2).to.be.ok;
      expect(object instanceof Class1).to.be.ok;
    });

    describe('adds _super function that', function() {

      it('calls overwritten methods', function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction() {
            this._super('myFunction');
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).to.have.been.called;
      });

      it('calls overwritten methods with arguments', function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction() {
            this._super('myFunction', [1, 2, 3]);
          }
        });
        (new Class2()).myFunction();

        expect(Class1.prototype.myFunction).to.have.been.calledWith(1, 2, 3);
      });

      it('calls overwritten methods with context', function() {
        Class1.prototype.myFunction = spy();

        Class2.prototype = extendPrototype(Class1, {
          myFunction() {
            this._super('myFunction');
          }
        });
        let instance = new Class2();
        instance.myFunction();

        expect(Class1.prototype.myFunction).to.have.been.calledOn(instance);
      });

      it("returns the overwritten method's return value", function() {
        Class1.prototype.myFunction = function() {
          return 23;
        };

        Class2.prototype = extendPrototype(Class1, {
          myFunction() {
            return this._super('myFunction') + 1;
          }
        });
        let instance = new Class2();
        let result = instance.myFunction();
        expect(result).to.equal(24);
      });

    });

  });

});

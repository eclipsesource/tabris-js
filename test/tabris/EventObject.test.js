import {expect} from '../test';
import EventObject from '../../src/tabris/EventObject';

describe('EventObject', function() {

  let target, event;

  beforeEach(function() {
    target = {toString: () => '"Foo"'};
    event = new EventObject();
  });

  describe('constructor', function() {

    it('sets current timestamp', function() {
      expect(event.timeStamp).to.be.above(0);
      expect(event.timeStamp).to.be.closeTo(Date.now(), 100);
    });

    it('other properties have default values', function() {
      expect(event.type).to.be.equal('');
      expect(event.target).to.be.null;
    });

  });

  describe('initialized instance', function() {

    beforeEach(function() {
      event._initEvent('foo', target);
    });

    it('can not be initialized again', function() {
      expect(() => event._initEvent('foo', target)).to.throw;
    });

    describe('type', function() {

      it('is read-only', function() {
        event.type = 'bar';
        expect(event.type).to.equal('foo');
      });

      it('is enumerable', function() {
        expect(Object.keys(event)).to.include('type');
      });

    });

    describe('target', function() {

      it('is read-only', function() {
        event.target = {};
        expect(event.target).to.equal(target);
      });

      it('is enumerable', function() {
        expect(Object.keys(event)).to.include('target');
      });

    });

    describe('timeStamp', function() {

      it('is read-only', function() {
        event.timeStamp = 23;
        expect(event.timeStamp).to.be.closeTo(Date.now(), 100);
      });

      it('is enumerable', function() {
        expect(Object.keys(event)).to.include('timeStamp');
      });

    });

    describe('defaultPrevented', function() {

      it('is read-only', function() {
        event.defaultPrevented = true;
        expect(event.defaultPrevented).to.be.false;
      });

    });

    describe('preventDefault', function() {

      it('sets defaultPrevented', function() {
        event.preventDefault();
        expect(event.defaultPrevented).to.be.true;
      });

    });

    describe('toString', function() {

      it('returns json-like with instance fields', function() {
        event.foo = 'bar';
        Object.defineProperty(event, 'bar', {value: true, enumerable: true});

        expect(event.toString()).to.match(/^EventObject\s{\s[a-z].*\s}$/);
        expect(eval('(' + event.toString().slice(12) + ');')).to.deep.equal({
          type: 'foo',
          target: 'Foo',
          timeStamp: event.timeStamp,
          foo: 'bar',
          bar: true
        });
      });

    });

  });

});

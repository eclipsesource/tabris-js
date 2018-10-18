import Constraint from '../../src/tabris/Constraint';
import Composite from '../../src/tabris/widgets/Composite';
import ActionSheet from '../../src/tabris/ActionSheet';
import Percent from '../../src/tabris/Percent';
import {expect, mockTabris, restore} from '../test';
import ClientStub from './ClientStub';

describe('Constraint', function() {

  let constraint;
  let widget;
  let client;

  afterEach(restore);

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    widget = new Composite();
    constraint = new Constraint(widget, 0.2);
  });

  describe('constructor', function() {

    it('creates instance from percent and offset', function() {
      // TODO: Percent should allow values < 0 and > 100
      [40.4, 0].forEach(value => {
        const constraint = new Constraint(new Percent(value), 23.1);

        expect(constraint.reference).to.be.instanceof(Percent);
        expect(constraint.reference.percent).to.equal(value);
        expect(constraint.offset).to.equal(23.1);
      });
    });

    it('creates instance from id selector string and offset', function() {
      ['Type', '.class', '#id', '*'].forEach(value => {
        const constraint = new Constraint(value, 23.1);

        expect(constraint.reference).to.equal(value);
        expect(constraint.offset).to.equal(23.1);
      });
    });

    it('creates instance from class selector string and offset', function() {
      const constraint = new Constraint('.foo', 23.1);

      expect(constraint.reference).to.equal('.foo');
      expect(constraint.offset).to.equal(23.1);
    });

    it('creates instance from widget instance and offset', function() {
      const constraint = new Constraint(widget, 23.1);

      expect(constraint.reference).to.equal(widget);
      expect(constraint.offset).to.equal(23.1);
    });

    it('throws for missing parameters', function() {
      expect(() => new Constraint('#foo', null)).to.throw();
      expect(() => new Constraint('#foo', undefined)).to.throw();
      expect(() => new Constraint('#foo')).to.throw();
      expect(() => new Constraint(null)).to.throw();
      expect(() => new Constraint(undefined)).to.throw();
      expect(() => new Constraint()).to.throw();
    });

    it('throws for invalid offset', function() {
      [NaN, undefined, null, '50%', Infinity, {}].forEach(value => {
        expect(() => new Constraint('#foo', value)).to.throw();
      });
    });

    it('throws for invalid selector string', function() {
      ['foo > bar','50%', 'next()', 'prev()'].forEach(value => {
        expect(() => new Constraint(value, 1)).to.throw();
      });
    });

    it('throws for invalid reference types', function() {
      [{}, new ActionSheet(), [], 23, true].forEach(value => {
        expect(() => new Constraint(value, 1)).to.throw();
      });
    });

  });

  describe('any constraint', function() {

    let constraint;

    beforeEach(function() {
      constraint = new Constraint('#foo', 0.2);
    });

    it ('has read-only properties', function() {
      constraint.reference = '#bar';
      constraint.offset = 1;

      expect(constraint.reference).to.equal('#foo');
      expect(constraint.offset).to.equal(0.2);
    });

  });

  describe('selector constraint', function() {

    let constraint;

    beforeEach(function() {
      constraint = new Constraint('#foo', 0.2);
    });

    it ('converts to string', function() {
      expect(constraint.toString()).to.equal('#foo 0.2');
    });

    it ('converts to array', function() {
      expect(constraint.toArray()).to.deep.equal(['#foo', 0.2]);
    });

  });

  describe('percentage constraint', function() {

    let constraint;

    beforeEach(function() {
      constraint = new Constraint(new Percent(50), 0.2);
    });

    it ('converts to string', function() {
      expect(constraint.toString()).to.equal('50% 0.2');
    });

    it ('converts to array', function() {
      expect(constraint.toArray()).to.deep.equal([new Percent(50), 0.2]);
      expect(constraint.toArray()[0]).to.be.instanceof(Percent);
    });
  });

  describe('prev() constraint', function() {

    let constraint;

    beforeEach(function() {
      constraint = new Constraint(Constraint.prev, 0.2);
    });

    it ('converts to string', function() {
      expect(constraint.toString()).to.equal('prev() 0.2');
    });

    it ('converts to array', function() {
      expect(constraint.toArray()).to.deep.equal([Constraint.prev, 0.2]);
    });

  });

  describe('next() constraint', function() {

    let constraint;

    beforeEach(function() {
      constraint = new Constraint(Constraint.next, 0.2);
    });

    it ('converts to string', function() {
      expect(constraint.toString()).to.equal('next() 0.2');
    });

    it ('converts to array', function() {
      expect(constraint.toArray()).to.deep.equal([Constraint.next, 0.2]);
    });

  });

  describe('widget instance constraint', function() {

    it ('converts to string', function() {
      const cid = widget.cid;
      // TODO: We should actually support this as a selector for consistency
      expect(constraint.toString()).to.equal(`Composite[cid="${cid}"] 0.2`);
    });

    it ('converts to array', function() {
      expect(constraint.toArray()).to.deep.equal([widget, 0.2]);
    });

  });

  describe('from', function() {

    it('creates constraint instance', function() {
      expect(Constraint.from('#foo')).to.be.instanceof(Constraint);
    });

    it('throws for invalid constraintValue', function() {
      [NaN, undefined, null, Infinity, 'a b', 'foo > bar', {left: 0}, [], ['#foo', 23, 23]].forEach(value => {
        expect(() => Constraint.from(value)).to.throw();
      });
    });

    it('creates constraint from string', function() {
      expect(Constraint.from('#foo')).to.deep.equal({reference: '#foo', offset: 0});
      expect(Constraint.from('.foo 23')).to.deep.equal({reference: '.foo', offset: 23});
    });

    it('creates constraint from widget', function() {
      const constraint = Constraint.from(widget);
      expect(constraint.reference).to.equal(widget);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from percent', function() {
      const constraint = Constraint.from(new Percent(50));
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from percent-like', function() {
      const constraint = Constraint.from({percent: 50});
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from next()', function() {
      const constraint = Constraint.from('next()');
      expect(constraint.reference).to.equal(Constraint.next);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from next()', function() {
      const constraint = Constraint.from(Constraint.next);
      expect(constraint.reference).to.equal(Constraint.next);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from prev()', function() {
      const constraint = Constraint.from('prev()');
      expect(constraint.reference).to.equal(Constraint.prev);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from prev()', function() {
      const constraint = Constraint.from(Constraint.prev);
      expect(constraint.reference).to.equal(Constraint.prev);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from Constraint-like object with widget and offset', function() {
      const constraint = Constraint.from({reference: widget, offset: 23});
      expect(constraint.reference).to.equal(widget);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from Constraint-like object with widget only', function() {
      const constraint = Constraint.from({reference: widget});
      expect(constraint.reference).to.equal(widget);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from Constraint-like object with percent only', function() {
      const constraint = Constraint.from({reference: new Percent(50)});
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from Constraint-like object with percent-like only', function() {
      const constraint = Constraint.from({percent: 50});
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from array with widget and offset', function() {
      const constraint = Constraint.from([widget, 23]);
      expect(constraint.reference).to.equal(widget);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with percent and offset', function() {
      const constraint = Constraint.from([new Percent(50), 23]);
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with percent-like and offset', function() {
      const constraint = Constraint.from([{percent: 50}, 23]);
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with prev and offset', function() {
      const constraint = Constraint.from([Constraint.prev, 23]);
      expect(constraint.reference).to.equal(Constraint.prev);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with prev() and offset', function() {
      const constraint = Constraint.from(['prev()', 23]);
      expect(constraint.reference).to.equal(Constraint.prev);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with next and offset', function() {
      const constraint = Constraint.from([Constraint.next, 23]);
      expect(constraint.reference).to.equal(Constraint.next);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with next() and offset', function() {
      const constraint = Constraint.from(['next()', 23]);
      expect(constraint.reference).to.equal(Constraint.next);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from Constraint-like object with selector and offset', function() {
      const constraint = Constraint.from({reference: '#foo', offset: 23});
      expect(constraint.reference).to.equal('#foo');
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from Constraint-like object with selector only', function() {
      const constraint = Constraint.from({reference: '#foo'});
      expect(constraint.reference).to.equal('#foo');
      expect(constraint.offset).to.equal(0);
    });

    it('creates constraint from Constraint-like object with percent-like and offset', function() {
      const constraint = Constraint.from({reference: {percent: 50}, offset: 23});
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(50);
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from array with selector and offset', function() {
      const constraint = Constraint.from(['#foo', 23]);
      expect(constraint.reference).to.equal('#foo');
      expect(constraint.offset).to.equal(23);
    });

    it('creates constraint from Constraint-like object without reference', function() {
      const constraint = Constraint.from({offset: 23});
      expect(constraint.reference).to.instanceof(Percent);
      expect(constraint.reference.percent).to.equal(0);
      expect(constraint.offset).to.equal(23);
    });

  });

});

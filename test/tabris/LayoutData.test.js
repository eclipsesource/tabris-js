import Constraint from '../../src/tabris/Constraint';
import Composite from '../../src/tabris/widgets/Composite';
import Percent from '../../src/tabris/Percent';
import LayoutData from '../../src/tabris/LayoutData';
import {expect, mockTabris, restore} from '../test';
import ClientMock from './ClientMock';

describe('LayoutData', function() {

  const exampleData = {
    left: new Constraint(new Percent(0), 0),
    top: new Constraint(new Percent(1), 1),
    width: 100,
    baseline: LayoutData.prev,
    centerX: 10,
    bottom: new Constraint(new Percent(2), 2),
    right: new Constraint(new Percent(3), 3),
    height: 50,
    centerY: 0
  };

  let widget;
  let client;

  afterEach(restore);

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    widget = new Composite();
  });

  describe('constructor', function() {

    it('creates instance from complete layoutData', function() {
      ['auto', new Constraint(new Percent(0), 23), new Constraint(widget, 23)].forEach(constraint => {
        ['auto', 23].forEach(dimension => {
          ['auto', LayoutData.prev, LayoutData.next, '#foo'].forEach(reference => {
            const layoutData = {
              left: constraint,
              top: constraint,
              bottom: constraint,
              right: constraint,
              width: dimension,
              height: dimension,
              baseline: reference,
              centerX: dimension,
              centerY: dimension
            };

            expect(new LayoutData(layoutData)).to.be.instanceof(LayoutData);
            expect(new LayoutData(layoutData)).to.deep.equal(layoutData);
          });
        });
      });
    });

    it('creates instance from partial layoutData', function() {
      const firstHalf = {
        left: new Constraint(widget, 0),
        top: new Constraint(widget, 1),
        width: 100,
        baseline: widget,
        centerX: 0
      };
      const secondHalf = {
        bottom: new Constraint(widget, 2),
        right: new Constraint(widget, 3),
        height: 100,
        centerY: 0
      };

      expect(new LayoutData(firstHalf)).to.deep.equal({
        left: new Constraint(widget, 0),
        top: new Constraint(widget, 1),
        width: 100,
        baseline: widget,
        centerX: 0,
        bottom: 'auto',
        right: 'auto',
        height: 'auto',
        centerY: 'auto'
      });
      expect(new LayoutData(secondHalf)).to.deep.equal({
        left: 'auto',
        top: 'auto',
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: new Constraint(widget, 2),
        right: new Constraint(widget, 3),
        height: 100,
        centerY: 0
      });
    });

    it('creates instance from empty object', function() {
      expect(new LayoutData({})).to.deep.equal({
        left: 'auto',
        top: 'auto',
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: 'auto',
        right: 'auto',
        height: 'auto',
        centerY: 'auto'
      });
    });

    it('throws for invalid parameters', function() {
      expect(() => new LayoutData()).to.throw();
      expect(() => new LayoutData(23)).to.throw();
      expect(() => new LayoutData(null)).to.throw();
      expect(() => new LayoutData(undefined)).to.throw();
      expect(() => new LayoutData(new Date())).to.throw();
      expect(() => new LayoutData({left: '#foo'})).to.throw();
      expect(() => new LayoutData({top: null})).to.throw();
      expect(() => new LayoutData({right: undefined})).to.throw();
      expect(() => new LayoutData({bottom: 0})).to.throw();
      expect(() => new LayoutData({width: -1})).to.throw();
      expect(() => new LayoutData({height: -1})).to.throw();
      expect(() => new LayoutData({centerX: Infinity})).to.throw();
      expect(() => new LayoutData({centerY: '#foo'})).to.throw();
      expect(() => new LayoutData({baseline: 0})).to.throw();
    });

  });

  describe('any layoutData instance', function() {

    let layoutData;

    beforeEach(function() {
      layoutData = new LayoutData(exampleData);
    });

    it ('has read-only properties', function() {
      layoutData.left = 'auto';
      layoutData.top = 'auto';
      layoutData.right = 'auto';
      layoutData.bottom = 'auto';
      layoutData.width = 'auto';
      layoutData.height = 'auto';
      layoutData.centerX = 'auto';
      layoutData.centerY = 'auto';
      layoutData.baseline = 'auto';

      expect(layoutData).to.deep.equal(exampleData);
    });

    it ('toString creates JSON', function() {
      expect(JSON.parse(layoutData.toString())).to.deep.equal({
        left: '0% 0',
        top: '1% 1',
        width: 100,
        baseline: 'prev()',
        centerX: 10,
        bottom: '2% 2',
        right: '3% 3',
        height: 50,
        centerY: 0
      });
    });

  });

  describe('from', function() {

    it('creates LayoutData instance', function() {
      expect(LayoutData.from(exampleData)).to.be.instanceof(LayoutData);
    });

    it('throws for invalid LayoutDataValue', function() {
      [NaN, undefined, null, Infinity, '#foo', {left: {}}, [], {width: -1}].forEach(value => {
        expect(() => LayoutData.from(value)).to.throw();
      });
    });

    it('passes through LayoutData instance', function() {
      const layoutData = new LayoutData(exampleData);
      expect(LayoutData.from(layoutData)).to.equal(layoutData);
    });

    it('creates LayoutData from empty object', function() {
      expect(LayoutData.from({})).to.deep.equal(new LayoutData({}));
    });

    it('creates LayoutData from auto-only object', function() {
      expect(LayoutData.from({
        left: 'auto',
        top: 'auto',
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: 'auto',
        right: 'auto',
        height: 'auto',
        centerY: 'auto'
      })).to.deep.equal(new LayoutData({}));
    });

    it('creates LayoutData from null-only object', function() {
      expect(LayoutData.from({
        left: null,
        top: null,
        width: null,
        baseline: null,
        centerX: null,
        bottom: null,
        right: null,
        height: null,
        centerY: null
      })).to.deep.equal(new LayoutData({}));
    });

    it('creates LayoutData from undefined-only object', function() {
      expect(LayoutData.from({
        left: undefined,
        top: undefined,
        width: undefined,
        baseline: undefined,
        centerX: undefined,
        bottom: undefined,
        right: undefined,
        height: undefined,
        centerY: undefined
      })).to.deep.equal(new LayoutData({}));
    });

    it('creates LayoutData from string "stretch"', function() {
      expect(LayoutData.from('stretch')).to.equal(LayoutData.stretch);
    });

    it('creates LayoutData from string "center"', function() {
      expect(LayoutData.from('center')).to.equal(LayoutData.center);
    });

    it('creates LayoutData from string "stretchX"', function() {
      expect(LayoutData.from('stretchX')).to.equal(LayoutData.stretchX);
    });

    it('creates LayoutData from string "stretchY"', function() {
      expect(LayoutData.from('stretchY')).to.equal(LayoutData.stretchY);
    });

    it('normalizes layoutData', function() {
      const altExampleData = {
        left: 0,
        top: '1% 1',
        width: '100',
        baseline: true,
        centerX: 10,
        bottom: '2% 2',
        right: ['3%', 3],
        height: 50,
        centerY: true
      };

      expect(LayoutData.from(altExampleData)).to.deep.equal(LayoutData.from(exampleData));
    });

  });

  describe('stretch', function() {

    it('sets left/top/right/bottom to 0', function() {
      expect(LayoutData.stretch).to.deep.equal(new LayoutData({
        left: new Constraint(new Percent(0), 0),
        top: new Constraint(new Percent(0), 0),
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: new Constraint(new Percent(0), 0),
        right: new Constraint(new Percent(0), 0),
        height: 'auto',
        centerY: 'auto'
      }));
    });

    it('is read-only', function() {
      const original = LayoutData.stretch;
      // @ts-ignore
      LayoutData.stretch = null;

      expect(LayoutData.stretch).to.equal(original);
    });

  });

  describe('center', function() {

    it('center', function() {
      expect(LayoutData.center).to.deep.equal(new LayoutData({
        left: 'auto',
        top: 'auto',
        width: 'auto',
        baseline: 'auto',
        centerX: 0,
        bottom: 'auto',
        right: 'auto',
        height: 'auto',
        centerY: 0
      }));
    });

    it('is read-only', function() {
      const original = LayoutData.center;
      // @ts-ignore
      LayoutData.center = null;

      expect(LayoutData.center).to.equal(original);
    });

  });

  describe('stretchX', function() {

    it('sets left/right to 0', function() {
      expect(LayoutData.stretchX).to.deep.equal(new LayoutData({
        left: new Constraint(new Percent(0), 0),
        top: 'auto',
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: 'auto',
        right: new Constraint(new Percent(0), 0),
        height: 'auto',
        centerY: 'auto'
      }));
    });

    it('is read-only', function() {
      const original = LayoutData.stretchX;
      // @ts-ignore
      LayoutData.stretchX = null;

      expect(LayoutData.stretchX).to.equal(original);
    });

  });

  describe('stretchY', function() {

    it('sets top/bottom to 0', function() {
      expect(LayoutData.stretchY).to.deep.equal(new LayoutData({
        left: 'auto',
        top: new Constraint(new Percent(0), 0),
        width: 'auto',
        baseline: 'auto',
        centerX: 'auto',
        bottom: new Constraint(new Percent(0), 0),
        right: 'auto',
        height: 'auto',
        centerY: 'auto'
      }));
    });

    it('is read-only', function() {
      const original = LayoutData.stretchY;
      // @ts-ignore
      LayoutData.stretchY = null;

      expect(LayoutData.stretchY).to.equal(original);
    });

  });

});

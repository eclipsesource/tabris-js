import Percent from '../../src/tabris/Percent';
import {expect} from '../test';

describe('Percent', function() {

  describe('constructor', function() {

    it('creates instance from four valid parameters', function() {
      const {percent} = new Percent(50);

      expect(percent).to.equal(50);
    });

    it('throws for invalid parameters', function() {
      expect(() => new Percent()).to.throw('Not enough arguments');
      expect(() => new Percent('foo')).to.throw('Invalid Percent: Invalid number foo');
      expect(() => new Percent(NaN)).to.throw('Invalid Percent: Invalid number NaN');
      expect(() => new Percent(Infinity)).to.throw('Invalid Percent: Invalid number Infinity');
      expect(() => new Percent(-Infinity)).to.throw('Invalid Percent: Invalid number -Infinity');
    });

  });

  describe('instance', function () {

    it('properties are read-only', function() {
      const percent = new Percent(5);

      percent.percent = 1;

      expect(percent.percent).to.equal(5);
    });

    describe('toString', function() {

      it('returns percent string', function() {
        expect(new Percent(5).toString()).to.equal('5%');
      });

    });

    describe('valueOf', function() {

      it('return percent value', function() {
        expect(new Percent(5).valueOf()).to.equal(5);
      });

    });

  });

  describe('from', function() {

    it('return percent instances', function() {
      expect(Percent.from('5%')).to.be.instanceOf(Percent);
      expect(Percent.from({percent: 5})).to.be.instanceOf(Percent);
      expect(Percent.from(new Percent(5))).to.be.instanceOf(Percent);
    });

    it('passes through percent object', function() {
      const percent = new Percent(5);
      expect(Percent.from(percent)).to.equal(percent);
    });

    it('rejects Percent-like object with missing percent', function() {
      expect(() => Percent.from()).to.throw('Not a valid PercentValue: undefined');
      expect(() => Percent.from({})).to.throw('Percent-like object missing percent value');
    });

    it('rejects Percent-like object with invalid percent string', function() {
      expect(() => Percent.from('foo')).to.throw('Invalid percent string foo: It must be a number followed by "%"');
      expect(() => Percent.from('foo%')).to.throw('Invalid percent string foo%: It must be a number followed by "%"');
      expect(() => Percent.from('NaN')).to.throw('Invalid percent string NaN: It must be a number followed by "%"');
      expect(() => Percent.from(Infinity)).to.throw('Not a valid PercentValue: Infinity');
      expect(() => Percent.from(-Infinity)).to.throw('Not a valid PercentValue: -Infinity');
    });

  });

  describe('isValidPercentValue', function() {

    it('returns true for percent values', function() {
      expect(Percent.isValidPercentValue(new Percent(0))).to.be.true;
      expect(Percent.isValidPercentValue({percent: 5})).to.be.true;
      expect(Percent.isValidPercentValue('5%')).to.be.true;
      expect(Percent.isValidPercentValue('105%')).to.be.true;
      expect(Percent.isValidPercentValue('-5%')).to.be.true;
    });

    it('returns false for non-percent values including null', function() {
      expect(Percent.isValidPercentValue(null)).to.be.false;
      expect(Percent.isValidPercentValue(5)).to.be.false;
      expect(Percent.isValidPercentValue({percent: Infinity})).to.be.false;
      expect(Percent.isValidPercentValue({percent: -Infinity})).to.be.false;
      expect(Percent.isValidPercentValue(NaN)).to.be.false;
      expect(Percent.isValidPercentValue(' ')).to.be.false;
    });

  });

});

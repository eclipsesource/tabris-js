import LinearGradient from '../../src/tabris/LinearGradient';
import Color from '../../src/tabris/Color';
import {expect} from '../test';
import Percent from '../../src/tabris/Percent';

describe('LinearGradient', function() {

  describe('constructor', function() {

    it('throws for missing color stops', function() {
      expect(() => new LinearGradient()).to.throw('Not enough arguments');
    });

    it('throws for invalid direction', function() {
      expect(() => new LinearGradient([Color.red], {})).to.throw('Invalid direction angle');
      expect(() => new LinearGradient([Color.red], NaN)).to.throw('Invalid direction angle: Invalid number NaN');
      expect(() => new LinearGradient([Color.red], Infinity))
        .to.throw('Invalid direction angle: Invalid number Infinity');
    });

    it('throws for invalid colorStops', function() {
      expect(() => new LinearGradient(5)).to.throw('colorStops must be an array');
      expect(() => new LinearGradient([])).to.throw('colorStops must not be empty');
      expect(() => new LinearGradient(['red'])).to.throw(
        '"red" is not a valid color stop. It must be either [Color, Percent] or Color.'
      );
      expect(() => new LinearGradient([[Color.red]])).to.throw(
        '[Color] is not a valid color stop. It must be either [Color, Percent] or Color'
      );
      expect(() => new LinearGradient([['foo']])).to.throw(
        '["foo"] is not a valid color stop. It must be either [Color, Percent] or Color.'
      );
      expect(() => new LinearGradient([['foo', 8]])).to.throw(
        '["foo", 8] is not a valid color stop. It must be either [Color, Percent] or Color.'
      );
      expect(() => new LinearGradient([[Color.red, 8, 8]])).to.throw(
        '[Color, 8, 8] is not a valid color stop. It must be either [Color, Percent] or Color.'
      );
    });

    it('creates an instance from valid parameters', function() {
      const gradient = new LinearGradient([Color.red, Color.yellow], 90);

      expect(gradient.colorStops[0]).to.equal(Color.red);
      expect(gradient.colorStops[1]).to.equal(Color.yellow);
      expect(gradient.direction).to.equal(90);
    });

    it('creates an instance with color stops with percent offset', function() {
      const gradient = new LinearGradient([[Color.red, new Percent(5)], Color.yellow], 90);

      expect(gradient.colorStops[0]).to.deep.equal([Color.red, new Percent(5)]);
      expect(gradient.colorStops[1]).to.equal(Color.yellow);
      expect(gradient.direction).to.equal(90);
    });

    it('creates an instance with default direction', function() {
      const gradient = new LinearGradient([Color.red, Color.yellow]);

      expect(gradient.colorStops[0]).to.equal(Color.red);
      expect(gradient.colorStops[1]).to.equal(Color.yellow);
      expect(gradient.direction).to.equal(180);
    });

  });

  describe('instance', function() {

    it('properties are read-only', function() {
      const gradient = new LinearGradient([Color.red, Color.yellow], 5);

      gradient.colorStops = [Color.blue];
      gradient.direction = 6;

      expect(gradient.colorStops[0]).to.equal(Color.red);
      expect(gradient.colorStops[1]).to.equal(Color.yellow);
      expect(gradient.direction).to.equal(5);
    });

    describe('toString', function() {

      it('with a single color stop', function() {
        const gradient = new LinearGradient([Color.red]);

        expect(gradient.toString()).to.equal('linear-gradient(180deg, rgb(255, 0, 0))');
      });

      it('with multiple color stops', function() {
        const gradient = new LinearGradient([Color.red, Color.green]);

        expect(gradient.toString()).to.equal('linear-gradient(180deg, rgb(255, 0, 0), rgb(0, 128, 0))');
      });

      it('with angle direction', function() {
        const gradient = new LinearGradient([Color.red], 45);

        expect(gradient.toString()).to.equal('linear-gradient(45deg, rgb(255, 0, 0))');
      });

      it('with side direction', function() {
        const gradient = new LinearGradient([Color.red], 270);

        expect(gradient.toString()).to.equal('linear-gradient(270deg, rgb(255, 0, 0))');
      });

      it('colorStops array is immutable', function() {
        const gradient = new LinearGradient([Color.red]);

        expect(() => {
          gradient.colorStops.push(Color.green);
        }).to.throw(/object is not extensible/);
        expect(gradient.colorStops).to.deep.equal([Color.red]);
      });

    });

    it('properties are enumerable', function() {
      const gradient = new LinearGradient([Color.red], 0);
      const gradientLike = {colorStops: [Color.red], direction: 0};
      expect(Object.assign({}, gradient)).to.deep.equal(gradientLike);
    });

  });

  describe('from', function() {

    it('returns LinearGradient instances', function() {
      expect(LinearGradient.from(new LinearGradient([Color.red]))).to.be.instanceOf(LinearGradient);
      expect(LinearGradient.from({colorStops: [Color.red]})).to.be.instanceOf(LinearGradient);
      expect(LinearGradient.from({colorStops: ['red']})).to.be.instanceOf(LinearGradient);
      expect(LinearGradient.from({colorStops: [['red', '5%']]})).to.be.instanceOf(LinearGradient);
      expect(LinearGradient.from('linear-gradient(to left, red, blue)')).to.be.instanceOf(LinearGradient);
    });

    it('passes through LinearGradient object', function() {
      const gradient = new LinearGradient([Color.red]);
      expect(LinearGradient.from(gradient)).to.equal(gradient);
    });

    describe('with LinearGradient-like objects', function() {

      it('accepts LinearGradient-like objects without direction', function() {
        const gradient = LinearGradient.from({colorStops: [Color.red]});

        expect(gradient).to.deep.equal({colorStops: [Color.red], direction: 180});
      });

      it('accepts LinearGradient-like objects with color stops with string offsets', function() {
        const gradient = LinearGradient.from({colorStops: [[Color.red, '5%']]});

        expect(gradient).to.deep.equal({colorStops: [[Color.red, new Percent(5)]], direction: 180});
      });

      it('accepts LinearGradient-like objects with color stops with Percent offsets', function() {
        const gradient = LinearGradient.from({colorStops: [[Color.red, new Percent(5)]]});

        expect(gradient).to.deep.equal({colorStops: [[Color.red, new Percent(5)]], direction: 180});
      });

      it('accepts LinearGradient-like objects with direction', function() {
        const gradient = LinearGradient.from({colorStops: [Color.red], direction: 0});

        expect(gradient).to.deep.equal({colorStops: [Color.red], direction: 0});
      });

      it('rejects LinearGradient-like object without colorStops', function() {
        expect(() => {
          LinearGradient.from({direction: 0});
        }).to.throw('LinearGradient-like object missing colorStops value');
      });

    });

    describe('with CSS', function() {

      it('throws when input does not start with linear-gradient', () => {
        expect(() => LinearGradient.from('')).to.throw('Argument "" is not a valid linear gradient definition');
      });

      it('throws when input does not provide a color', () => {
        expect(() => LinearGradient.from('linear-gradient()')).to.throw('Invalid color stop value');
      });

      it('throws when stop value is not percent', () => {
        expect(() => LinearGradient.from('linear-gradient(red 20px)'))
          .to.throw('Invalid percent string 20px');
      });

      it('throws when direction is a corner', () => {
        expect(() => LinearGradient.from('linear-gradient(to right bottom, yellow, red)'))
          .to.throw('Invalid direction "right bottom". Corners are not supported.');
      });

      it('has default direction', () => {
        expect(LinearGradient.from('linear-gradient(red)').direction).to.equal(180);
      });

      it('maps direction to angle', () => {
        const directions = {top: 0, right: 90, bottom: 180, left: 270};
        for (const direction in directions) {
          expect(LinearGradient.from(`linear-gradient(to ${direction}, red)`).direction)
            .to.equal(directions[direction]);
        }
      });

      it('parses linear gradient definition correctly', () => {
        const gradients = {
          'linear-gradient(#f00, #00f)': {
            direction: 180,
            colorStops: [Color.red, Color.blue]
          },
          'linear-gradient(red, blue, green, white, yellow)': {
            direction: 180,
            colorStops: [Color.red, Color.blue, Color.green, Color.white, Color.yellow]
          },
          'linear-gradient(to left, red, blue 50%, red, purple, green 100%)': {
            direction: 270,
            colorStops: [Color.red, [Color.blue, {percent: 50}], Color.red, Color.purple, [Color.green, {percent: 100}]]
          },
          'linear-gradient(0deg, red 50%, green, white, blue)': {
            direction: 0,
            colorStops: [[Color.red, {percent: 50}], Color.green, Color.white, Color.blue]
          },
          'linear-gradient(-90deg, red, green 15%, white, blue 70%)': {
            direction: -90,
            colorStops: [Color.red, [Color.green, {percent: 15}], Color.white, [Color.blue, {percent: 70}]]
          },
          'linear-gradient(200deg, yellow 0%, silver 30%, blue 150%)': {
            direction: 200,
            colorStops: [[Color.yellow, {percent: 0}], [Color.silver, {percent: 30}], [Color.blue, {percent: 150}]]
          },
          'linear-gradient(145deg, red 0%, fuchsia 50%, blue 150%)': {
            direction: 145,
            colorStops: [[Color.red, {percent: 0}], [Color.fuchsia, {percent: 50}], [Color.blue, {percent: 150}]]
          },
          'linear-gradient(145deg, red 0%, green 50%, lime 150%)': {
            direction: 145,
            colorStops: [[Color.red, {percent: 0}], [Color.green, {percent: 50}], [Color.lime, {percent: 150}]]
          },
          'linear-gradient(145deg, lime -50%, purple 50%, yellow 150%)': {
            direction: 145,
            colorStops: [[Color.lime, {percent: -50}], [Color.purple, {percent: 50}], [Color.yellow, {percent: 150}]]
          },
          'linear-gradient(80deg, red -20%, blue 50%, green 180%)': {
            direction: 80,
            colorStops: [[Color.red, {percent: -20}], [Color.blue, {percent: 50}], [Color.green, {percent: 180}]]
          },
          'linear-gradient(400deg, red, blue 50%)': {
            direction: 400,
            colorStops: [Color.red, [Color.blue, {percent: 50}]]
          },
          'linear-gradient(to right, red -30%, blue 50%)': {
            direction: 90,
            colorStops: [[Color.red, {percent: -30}], [Color.blue, {percent: 50}]]
          },
          'linear-gradient(0deg, red 0%, red 25%, teal 25%, teal 50%, black 50%, black 75%, green 75%)': {
            direction: 0,
            colorStops: [
              [Color.red, {percent: 0}],
              [Color.red, {percent: 25}],
              [Color.teal, {percent: 25}],
              [Color.teal, {percent: 50}],
              [Color.black, {percent: 50}],
              [Color.black, {percent: 75}],
              [Color.green, {percent: 75}]
            ]
          },
          'linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)': {
            direction: 270,
            colorStops: [Color.from('#333'), [Color.from('#333'), {percent: 50}], [Color.from('#eee'), {percent: 75}],
              [Color.from('#333'), {percent: 75}]]
          },
          'linear-gradient(0deg, rgba(170, 255, 0, 0.5) 0%, rgba(0, 255, 0, 1) 100%)': {
            direction: 0,
            colorStops: [[new Color(170, 255, 0, 128), {percent: 0}], [Color.lime, {percent: 100}]]
          }
        };
        for (const gradientDefinition in gradients) {
          const target = gradients[gradientDefinition];
          expect(LinearGradient.from(gradientDefinition)).to.deep.equal(target);
        }
      });

    });

  });

  describe('isLinearGradientValue', function() {

    it('returns true for linear gradient values including null and "initial"', function() {
      expect(LinearGradient.isLinearGradientValue(null)).to.be.true;
      expect(LinearGradient.isLinearGradientValue('initial')).to.be.true;
      expect(LinearGradient.isLinearGradientValue(new LinearGradient([Color.red]))).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red]})).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red], direction: 5})).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red], direction: 'right'})).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [[Color.red, '5%']]})).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [[Color.red, new Percent(5)]]})).to.be.true;
      expect(LinearGradient.isLinearGradientValue({colorStops: [[Color.red, new Percent(5)]]})).to.be.true;
    });

    it('returns false for non-linear gradient values including null and "initial"', function() {
      expect(LinearGradient.isLinearGradientValue({colorStops: []})).to.be.false;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red, 'foo']})).to.be.false;
      expect(LinearGradient.isLinearGradientValue({colorStops: [[Color.red, '5']]})).to.be.false;
      expect(LinearGradient.isLinearGradientValue({colorStops: [[Color.red, {}]]})).to.be.false;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red], direction: 'foo'})).to.be.false;
      expect(LinearGradient.isLinearGradientValue({colorStops: [Color.red], direction: {}})).to.be.false;
    });

  });

  describe('isValidLinearGradient', function() {

    it('returns true for linear gradient values', function() {
      expect(LinearGradient.isValidLinearGradientValue(new LinearGradient([Color.red]))).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red]})).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red], direction: 5})).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red], direction: 'right'})).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [[Color.red, '5%']]})).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [[Color.red, new Percent(5)]]})).to.be.true;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [[Color.red, new Percent(5)]]})).to.be.true;
    });

    it('returns false for non-linear gradient values including null and "initial"', function() {
      expect(LinearGradient.isValidLinearGradientValue(null)).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue('initial')).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: []})).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red, 'foo']})).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [[Color.red, '5']]})).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [[Color.red, {}]]})).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red], direction: 'foo'})).to.be.false;
      expect(LinearGradient.isValidLinearGradientValue({colorStops: [Color.red], direction: {}})).to.be.false;
    });

  });

  describe('equals', function() {

    it('returns false for non LinearGradient instance values', function() {
      const lg = new LinearGradient([Color.red, Color.blue], 90);
      [NaN, undefined, null, Infinity, {}, 'linear-gradient(to right, red, blue)'].forEach(value => {
        expect(lg.equals(value)).to.be.false;
      });
    });

    it('returns true for equal LinearGradient instance values', function() {
      expect(
        new LinearGradient([Color.red, Color.yellow], 90).equals(
          new LinearGradient([Color.red, Color.yellow], 90)
        )
      ).to.be.true;
      expect(
        new LinearGradient([[Color.red, new Percent(5)], Color.yellow], 45).equals(
          new LinearGradient([[Color.red, new Percent(5)], Color.yellow], 45)
        )
      ).to.be.true;
      expect(
        new LinearGradient([Color.red, Color.yellow]).equals(
          new LinearGradient([Color.red, Color.yellow])
        )
      ).to.be.true;
    });

    it('returns false for non-equal LinearGradient instance values', function() {
      expect(
        new LinearGradient([Color.red, Color.yellow], 90).equals(
          new LinearGradient([Color.red, Color.yellow], 91)
        )
      ).to.be.false;
      expect(
        new LinearGradient([[Color.red, new Percent(4)], Color.yellow], 45).equals(
          new LinearGradient([[Color.red, new Percent(5)], Color.yellow], 45)
        )
      ).to.be.false;
      expect(
        new LinearGradient([Color.red, Color.yellow], 45).equals(
          new LinearGradient([[Color.red, new Percent(0)], Color.yellow], 45)
        )
      ).to.be.false;
      expect(
        new LinearGradient([Color.green, Color.yellow]).equals(
          new LinearGradient([Color.red, Color.yellow])
        )
      ).to.be.false;
      expect(
        new LinearGradient([Color.green, Color.yellow]).equals(
          new LinearGradient([Color.green, Color.red])
        )
      ).to.be.false;
    });

  });

});

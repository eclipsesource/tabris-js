import {expect} from '../test';
import {ColorShader, LinearGradientShader} from '../../src/tabris/util-shaders';

describe('util-shaders', () => {

  describe('ColorShader', () => {

    it('throws when input is not an array', () => {
      expect(() => new ColorShader('string')).to.throw('Argument is not an Array');
    });

    it('has type "color"', () => {
      expect(new ColorShader([1, 2, 3]).type).to.equal('color');
    });

    it('stores value of color', () => {
      expect(new ColorShader([1, 2, 3]).color).to.deep.equal([1, 2, 3]);
    });

  });

  describe('LinearGradientShader', () => {

    it('throws when input is not a string', () => {
      expect(() => new LinearGradientShader()).to.throw('Argument is not a string');
    });

    it('throws when input does not start with linear-gradient', () => {
      expect(() => new LinearGradientShader('')).to.throw('Argument is not a valid linear gradient definition');
    });

    it('throws when input does not provide a color', () => {
      expect(() => new LinearGradientShader('linear-gradient()')).to.throw();
    });

    it('throws when stop value is not percent', () => {
      expect(() => new LinearGradientShader('linear-gradient(red 20px)'))
        .to.throw('Invalid color stop percentage');
    });

    it('has default angle of 180', () => {
      expect(new LinearGradientShader('linear-gradient(red)').angle).to.equal(180);
    });

    it('maps direction to angle', () => {
      let directions = {
        'top': 0,
        'right': 90,
        'bottom': 180,
        'left': 270,
        'left top': 315,
        'left bottom': 225,
        'right top': 45,
        'right bottom': 135
      };
      for (let direction in directions) {
        expect(new LinearGradientShader(`linear-gradient(to ${direction}, red)`).angle)
          .to.equal(directions[direction]);
      }
    });

    it('parses linear gradient definition correctly', () => {
      let gradients = {
        'linear-gradient(#f00, #00f)': {
          type: 'linearGradient', angle: 180,
          colors: [[[255, 0, 0, 255], null], [[0, 0, 255, 255], null]]
        },
        'linear-gradient(red, blue, green, white, yellow)': {
          type: 'linearGradient', angle: 180,
          colors: [[[255, 0, 0, 255], null], [[0, 0, 255, 255], null], [[0, 128, 0, 255], null],
            [[255, 255, 255, 255], null], [[255, 255, 0, 255], null]]
        },
        'linear-gradient(to left, red, blue 50%, red, purple, green 100%)': {
          type: 'linearGradient', angle: 270,
          colors: [[[255, 0, 0, 255], null], [[0, 0, 255, 255], 0.5], [[255, 0, 0, 255], null],
            [[128, 0, 128, 255], null], [[0, 128, 0, 255], 1]]
        },
        'linear-gradient(0deg, red 50%, green, white, blue)': {
          type: 'linearGradient', angle: 0,
          colors: [[[255, 0, 0, 255], 0.5], [[0, 128, 0, 255], null], [[255, 255, 255, 255], null],
            [[0, 0, 255, 255], null]]
        },
        'linear-gradient(-90deg, red, green 15%, white, blue 70%)': {
          type: 'linearGradient', angle: -90,
          colors: [[[255, 0, 0, 255], null], [[0, 128, 0, 255], 0.15], [[255, 255, 255, 255], null],
            [[0, 0, 255, 255], 0.7]]
        },
        'linear-gradient(to right top, red 0%, green 50%, aqua 150%)': {
          type: 'linearGradient', angle: 45,
          colors: [[[255, 0, 0, 255], 0], [[0, 128, 0, 255], 0.5], [[0, 255, 255, 255], 1.5]]
        },
        'linear-gradient(200deg, yellow 0%, silver 30%, blue 150%)': {
          type: 'linearGradient', angle: 200,
          colors: [[[255, 255, 0, 255], 0], [[192, 192, 192, 255], 0.3], [[0, 0, 255, 255], 1.5]]
        },
        'linear-gradient(145deg, red 0%, fuchsia 50%, blue 150%)': {
          type: 'linearGradient', angle: 145,
          colors: [[[255, 0, 0, 255], 0], [[255, 0, 255, 255], 0.5], [[0, 0, 255, 255], 1.5]]
        },
        'linear-gradient(145deg, red 0%, green 50%, lime 150%)': {
          type: 'linearGradient', angle: 145,
          colors: [[[255, 0, 0, 255], 0], [[0, 128, 0, 255], 0.5], [[0, 255, 0, 255], 1.5]]
        },
        'linear-gradient(145deg, lime -50%, purple 50%, yellow 150%)': {
          type: 'linearGradient', angle: 145,
          colors: [[[0, 255, 0, 255], -0.5], [[128, 0, 128, 255], 0.5], [[255, 255, 0, 255], 1.5]]
        },
        'linear-gradient(80deg, red -20%, blue 50%, green 180%)': {
          type: 'linearGradient',
          angle: 80,
          colors: [[[255, 0, 0, 255], -0.2], [[0, 0, 255, 255], 0.5], [[0, 128, 0, 255], 1.8]]
        },
        'linear-gradient(400deg, red, blue 50%)': {
          type: 'linearGradient', angle: 400,
          colors: [[[255, 0, 0, 255], null], [[0, 0, 255, 255], 0.5]]
        },
        'linear-gradient(to right, red -30%, blue 50%)': {
          type: 'linearGradient', angle: 90,
          colors: [[[255, 0, 0, 255], -0.3], [[0, 0, 255, 255], 0.5]]
        },
        'linear-gradient(0deg, red 0%, red 25%, teal 25%, teal 50%, black 50%, black 75%, green 75%)': {
          type: 'linearGradient', angle: 0,
          colors: [[[255, 0, 0, 255], 0], [[255, 0, 0, 255], 0.25], [[0, 128, 128, 255], 0.25],
            [[0, 128, 128, 255], 0.5], [[0, 0, 0, 255], 0.5], [[0, 0, 0, 255], 0.75], [[0, 128, 0, 255], 0.75]]
        },
        'linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%)': {
          type: 'linearGradient', angle: 270,
          colors: [[[51, 51, 51, 255], null], [[51, 51, 51, 255], 0.5], [[238, 238, 238, 255], 0.75],
            [[51, 51, 51, 255], 0.75]]
        },
        'linear-gradient(0deg, rgba(170, 255, 0, 0.5) 0%, rgba(0, 255, 0, 1) 100%)': {
          type: 'linearGradient', angle: 0,
          colors: [[[170, 255, 0, 128], 0], [[0, 255, 0, 255], 1]]
        }
      };
      for (let gradientDefinition in gradients) {
        let target = gradients[gradientDefinition];
        target.css = gradientDefinition;
        expect(new LinearGradientShader(gradientDefinition)).to.deep.equal(target);
      }
    });

  });

});

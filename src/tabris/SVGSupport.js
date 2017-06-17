import Canvas from './widgets/Canvas';
//import dummyDoc from './dummyDoc';
const canvg = require('canvg');

const Path2D = Path2D || class Path2D {
  constructor() {
    console.log('It is fake Path2D constructor');
  }
};

export default function(target) {
  target.SVGElement = function ({svgId, width = 100, height = 100, top = 0, left = 0, right = 0, bottom = 0, params = {}
    , children = []}) {
    return new Canvas({top, left, width, height, right, bottom})
      .on('resize', ({target: canvas, widthSVG, heightSVG}) => {
        return canvg(canvas
          , `<svg id='${svgId}' width='${widthSVG}' height='${heightSVG}'>${children.join('')}</svg>`, params);
      });
  };
  target.SVGPath = function ({d, width = 100, height = 100, top = 0, left = 0, right = 0, bottom = 0}) {
    if (typeof Path2D === 'undefined') {
      console.log('Warn: Path2D is not available');
      return;
    }
    return new Canvas({top, left, width, height, right, bottom})
      .on('resize', () => {
        return new Path2D(d);
      });
  };
}

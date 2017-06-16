import Canvas from './widget/Canvas';
//import dummyDoc from './dummyDoc';
const canvg = require('canvg');

export default function(target) {
  target.SVGElement = function ({svgId, width = 100, height = 100, top = 0, left = 0, right = 0, bottom = 0, params = {}
    , children = []}) {
    return new Canvas({top, left, width, height, right, bottom})
      .on('resize', ({target: canvas, widthSVG, heightSVG}) => {
        return canvg(canvas
          , `<svg id='${svgId}' width='${widthSVG}' height='${heightSVG}'>${children.join('')}</svg>`, params);
      });
  };
}

import Resources from './Resources';
import Color from './Color';

const COLOR_OPTIONS = {
  type: Color,
  converter: Color.from,
  validator: Color.isValidColorValue
};

export default class ColorResources extends Resources {

  static from() {
    const builder = Resources.build(/** @type {any} */(COLOR_OPTIONS));
    return builder.from.apply(builder, arguments);
  }

  constructor(options) {
    if (arguments.length !== 1) {
      throw new Error(`Expected 1 parameter, got ${arguments.length}`);
    }
    if (!(options instanceof Object)) {
      throw new Error(`Expected parameter 1 to be an object, got ${typeof options}`);
    }
    super(Object.assign({}, COLOR_OPTIONS, options));
  }

}

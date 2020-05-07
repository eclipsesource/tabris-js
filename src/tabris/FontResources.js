import Resources from './Resources';
import Font from './Font';

const FONT_OPTIONS = {
  type: Font,
  converter: Font.from,
  validator: Font.isValidFontValue
};

export default class FontResources extends Resources {

  static from() {
    const builder = Resources.build(/** @type {any} */(FONT_OPTIONS));
    return builder.from.apply(builder, arguments);
  }

  constructor(options) {
    if (arguments.length !== 1) {
      throw new Error(`Expected 1 parameter, got ${arguments.length}`);
    }
    if (!(options instanceof Object)) {
      throw new Error(`Expected parameter 1 to be an object, got ${typeof options}`);
    }
    super(Object.assign({}, FONT_OPTIONS, options));
  }

}

import Resources from './Resources';
import Font from './Font';
import checkType from './checkType';

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
    checkType(options, Object, {name: 'parameter 1'});
    super(Object.assign({}, FONT_OPTIONS, options));
  }

}

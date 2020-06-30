import Resources from './Resources';
import checkType from './checkType';

const TEXT_OPTIONS = {
  validator: value => typeof value === 'string'
};

export default class TextResources extends Resources {

  static from() {
    const builder = Resources.build(/** @type {any} */(TEXT_OPTIONS));
    return builder.from.apply(builder, arguments);
  }

  constructor(options) {
    if (arguments.length !== 1) {
      throw new Error(`Expected 1 parameter, got ${arguments.length}`);
    }
    checkType(options, Object, {name: 'parameter 1'});
    super(Object.assign({}, TEXT_OPTIONS, options));
  }

}

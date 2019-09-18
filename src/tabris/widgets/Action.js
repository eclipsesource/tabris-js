import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {JSX} from '../JsxProcessor';
import {types} from '../property-types';

export default class Action extends Widget {

  get _nativeType() {
    return 'tabris.Action';
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([['title', this.title]]);
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    return super[JSX.jsxFactory](Type, this.withContentText(
      normalAttributes,
      children,
      'title'
    ));
  }

}

NativeObject.defineProperties(Action.prototype, {
  image: {type: types.ImageValue, default: null},
  placement: {
    type: types.string,
    choice: ['default', 'navigation', 'overflow'],
    default: 'default'
  },
  title: {type: types.string, default: ''}
});

NativeObject.defineEvents(Action.prototype, {
  select: {native: true}
});

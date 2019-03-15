import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {jsxFactory} from '../JsxProcessor';

export default class Action extends Widget {

  get _nativeType() {
    return 'tabris.Action';
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([['title', this.title]]);
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    return super[jsxFactory](Type, this.withContentText(
      normalAttributes,
      children,
      'title'
    ));
  }

}

NativeObject.defineProperties(Action.prototype, {
  image: {type: 'ImageValue', default: null},
  placementPriority: {
    type: ['choice', ['low', 'high', 'normal']],
    set(name, value) {
      this._nativeSet(name, value.toUpperCase());
      this._storeProperty(name, value);
    },
    default: 'normal'
  },
  title: {type: 'string', default: ''}
});

NativeObject.defineEvents(Action.prototype, {
  select: {native: true}
});

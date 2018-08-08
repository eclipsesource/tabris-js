import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {jsxFactory} from '../JsxProcessor';

export default class Action extends Widget {

  get _nativeType() {
    return 'tabris.Action';
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return super[jsxFactory](Type, this.withTextContent(props, children, 'title'));
  }

}

NativeObject.defineProperties(Action.prototype, {
  image: {type: 'image', default: null},
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

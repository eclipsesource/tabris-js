import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';
import {jsxFactory} from './JsxProcessor';

export default class ActionSheet extends Popup {

  constructor(properties) {
    super();
    this._autoDispose = true;
    this._create('tabris.ActionSheet', properties);
  }

  get _nativeType() {
    return 'tabris.ActionSheet';
  }

  _trigger(name, event) {
    if (name === 'close') {
      super._trigger('close', event);
      this.dispose();
    } else {
      return super._trigger(name, event);
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    const flatChildren = this.normalizeChildren(children);
    const propsWithActions = this.withContentChildren(
      props,
      flatChildren.filter(child => child instanceof Object),
      'actions'
    );
    const finalProps = this.withContentText(
      propsWithActions,
      flatChildren.filter(child => !(child instanceof Object)),
      'message'
    );
    return this.createNativeObject(Type, finalProps);
  }

}

NativeObject.defineProperties(ActionSheet.prototype, {
  title: {type: 'string', default: ''},
  message: {type: 'string', default: ''},
  actions: {
    type: {
      encode(value) {
        if (!Array.isArray(value)) {
          throw new Error('value is not an array');
        }
        return value.map(action => {
          let result = {title: '' + action.title};
          if ('image' in action) {
            result.image = types.image.encode(action.image);
          }
          if ('style' in action) {
            if (!['default', 'cancel', 'destructive'].includes(action.style)) {
              throw new Error('Invalid action style');
            }
            result.style = action.style;
          }
          return result;
        });
      },
      decode(value) {
        return value.map(action => ({
          title: action.title,
          image: types.image.decode(action.image),
          style: action.style || 'default'
        }));
      }
    },
    default: () => []
  }
});

NativeObject.defineEvents(ActionSheet.prototype, {
  close: {native: true},
  select: {native: true}
});

export class ActionSheetItem {

  constructor({title, image, style} = {}) {
    Object.defineProperty(this, 'title', {get() { return title || ''; }, enumerable: true});
    Object.defineProperty(this, 'image', {get() { return image || null; }, enumerable: true});
    Object.defineProperty(this, 'style', {get() { return style || 'default'; }, enumerable: true});
  }

  /** @this {import("./JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return new Type(this.withContentText(props, children, 'title'));
  }

}

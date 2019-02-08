import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';
import {jsxFactory} from './JsxProcessor';

export default class ActionSheet extends Popup {

  static open(actionSheet) {
    if (!(actionSheet instanceof ActionSheet)) {
      throw new Error('Not an ActionSheet: ' + actionSheet);
    }
    return actionSheet.open();
  }

  /**
   * @param {Partial<ActionSheet>} properties
   */
  constructor(properties) {
    super(properties);
    this._index = null;
    this._action = null;
    this._autoDispose = true;
    this._nativeListen('select', true);
  }

  get _nativeType() {
    return 'tabris.ActionSheet';
  }

  _trigger(name, event) {
    if (name === 'select') {
      this._index = event.index;
      this._action = this.actions[this._index];
      super._trigger('select', Object.assign(event, {action: this._action}));
    } else if (name === 'close') {
      super._trigger('close', Object.assign(event, {index: this._index, action: this._action}));
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
          const result = {title: '' + (action.title || '')};
          if ('image' in action) {
            result.image = types.ImageValue.encode(action.image);
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
        return value.map(action => new ActionSheetItem({
          title: action.title,
          image: types.ImageValue.decode(action.image),
          style: action.style
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
    Object.defineProperty(this, 'title', {value: title || '', enumerable: true});
    Object.defineProperty(this, 'image', {value: image || null, enumerable: true});
    Object.defineProperty(this, 'style', {value: style || 'default', enumerable: true});
  }

  toString() {
    return this.title || '[object ActionSheetItem]';
  }

  /** @this {import("./JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    return new Type(this.withContentText(props, children, 'title'));
  }

}

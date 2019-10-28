import Popup from './Popup';
import NativeObject from './NativeObject';
import {types} from './property-types';
import {JSX} from './JsxProcessor';
import {toValueString} from './Console';
import {allowOnlyKeys, allowOnlyValues} from './util';

export default class ActionSheet extends Popup {

  static open(actionSheet) {
    if (!(actionSheet instanceof ActionSheet)) {
      throw new Error('Not an ActionSheet: ' + toValueString(actionSheet));
    }
    return actionSheet.open();
  }

  /**
   * @param {Partial<ActionSheet>} properties
   */
  constructor(properties) {
    super(properties);
    Object.defineProperties(this, {
      _index: {enumerable: false, writable: true, value: null},
      _action: {enumerable: false, writable: true, value: null}
    });
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
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes) || [];
    let normalAttributes = this.withoutChildren(attributes);
    normalAttributes = this.withContentChildren(
      normalAttributes,
      children.filter(child => child instanceof Object),
      'actions'
    );
    normalAttributes = this.withContentText(
      normalAttributes,
      children.filter(child => !(child instanceof Object)),
      'message'
    );
    return this.createNativeObject(Type, normalAttributes);
  }

}

NativeObject.defineProperties(ActionSheet.prototype, {
  title: {type: types.string, default: ''},
  message: {type: types.string, default: ''},
  actions: /** @type {TabrisProp<readonly ActionSheetItem[], ActionSheetItem[]>} */({
    type: {
      convert(value) {
        if (!Array.isArray(value)) {
          throw new Error(toValueString(value) + ' is not an array');
        }
        return Object.freeze(value.map(ActionSheetItem.from));
      },
      encode(value) {
        return value.map(action => ({
          title: action.title,
          image: types.ImageValue.encode(action.image),
          style: action.style
        }));
      }
    },
    default: Object.freeze([])
  })
});

NativeObject.defineEvents(ActionSheet.prototype, {
  close: {native: true},
  select: {native: true}
});

export class ActionSheetItem {

  /**
   * @param {{title?: any, image?: any, style?: any}} param0
   */
  constructor({title, image, style} = {}) {
    Object.defineProperty(this, 'title', {value: types.string.convert(title), enumerable: true});
    Object.defineProperty(this, 'image', {value: types.ImageValue.convert(image), enumerable: true});
    Object.defineProperty(this, 'style', {
      value: allowOnlyValues(style || 'default', ['default', 'cancel', 'destructive'], 'style'),
      enumerable: true
    });
  }

  toString() {
    return this.title || '[object ActionSheetItem]';
  }

  /** @this {import("./JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    return new Type(this.withContentText(normalAttributes, children, 'title'));
  }

  /**
   * @param {any} value
   */
  static from(value) {
    if (value instanceof ActionSheetItem) {
      return value;
    }
    if (value.constructor !== Object) {
      throw new Error('Can not convert a non-object to an ActionSheetItem');
    }
    try {
      return new ActionSheetItem(allowOnlyKeys(value, ['title', 'image', 'style']));
    } catch (ex) {
      throw new Error('Can not convert to an ActionSheetItem: ' + ex.message);
    }
  }
}

Object.defineProperty(ActionSheetItem.prototype, 'title', {value: ''});
Object.defineProperty(ActionSheetItem.prototype, 'image', {
  value: /** @type {import('./Image').default} */(null)
});
Object.defineProperty(ActionSheetItem.prototype, 'style', {
  value: /** @type {'default'|'cancel'|'destructive'} */('default')}
);

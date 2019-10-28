import Composite from './Composite';

export const creationAllowed = Symbol();

export default class ContentView extends Composite {

  /** @override */
  _nativeCreate(properties) {
    if (!properties || properties[creationAllowed] !== true) {
      throw new Error('ContentView can not be created');
    }
    Object.defineProperties(this, {
      _childType: {enumerable: false, writable: false, value: properties.childType},
      _phantom: {enumerable: false, writable: false, value: properties.phantom}
    });
    delete properties[creationAllowed];
    delete properties.childType;
    delete properties.phantom;
    if (this._phantom) {
      this._register();
      this._initLayout(properties);
    } else {
      super._nativeCreate(properties);
    }
  }

  /** @override */
  _nativeSet(name, value) {
    if (!this._phantom) {
      super._nativeSet(name, value);
    }
  }

  /** @override */
  _nativeGet(name) {
    if (!this._phantom) {
      return super._nativeGet(name);
    }
  }

  /** @override */
  _nativeListen(event, state) {
    if (!this._phantom) {
      return super._nativeListen(event, state);
    }
  }

  /** @override */
  _nativeCall(method, properties) {
    if (!this._phantom) {
      return super._nativeCall(method, properties);
    }
  }

  /** @override */
  _acceptChild(child) {
    if (!this._childType) {
      return true;
    }
    return child instanceof this._childType;
  }

  _setParent(parent, index) {
    if (this._parent) {
      throw new Error('Parent of ContentView can not be changed');
    }
    super._setParent(parent, index);
  }

  _dispose() {
    throw new Error('ContentView can not be disposed');
  }

}

export function create(properties) {
  return new ContentView(Object.assign({[creationAllowed]: true}, properties));
}

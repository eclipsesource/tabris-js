import Widget from '../Widget';
import NativeObject from '../NativeObject';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import Layout from '../Layout';
import WidgetCollection from '../WidgetCollection';
import {jsxFactory} from '../JsxProcessor';

export default class Composite extends Widget {

  append() {
    this._checkDisposed();
    let accept = (widget) => {
      if (!(widget instanceof NativeObject)) {
        throw new Error('Cannot append non-widget');
      }
      widget._setParent(this);
    };
    if (arguments[0] instanceof WidgetCollection) {
      arguments[0].toArray().forEach(accept);
    } else if (Array.isArray(arguments[0])) {
      arguments[0].forEach(accept);
    } else {
      Array.prototype.forEach.call(arguments, accept);
    }
    return this;
  }

  find(selector) {
    return new WidgetCollection(this.children(), {selector, origin: this, deep: true});
  }

  apply(sheet) {
    let scope = new WidgetCollection(
      asArray(this.children()).concat(this), {selector: '*', origin: this, deep: true}
    );
    return this._apply(sheet, scope);
  }

  children(selector) {
    return this._children(selector);
  }

  _children(selector) {
    return new WidgetCollection(this.$children, {selector, origin: this});
  }

  _find(selector) {
    return new WidgetCollection(this._children(), {selector, origin: this, deep: true});
  }

  _apply(sheet, scope) {
    if (arguments.length === 1) {
      scope = new WidgetCollection(
        asArray(this._children()).concat(this), {selector: '*', origin: this, deep: true}
      );
    }
    Object.keys(sheet)
      .map(key => [createSelectorArray(key, this), sheet[key]])
      .sort((rule1, rule2) => getSelectorSpecificity(rule1[0]) - getSelectorSpecificity(rule2[0]))
      .forEach(rule => {
        scope.filter(rule[0]).set(rule[1]);
      });
    return this;
  }

  get _nativeType() {
    return 'tabris.Composite';
  }

  _acceptChild() {
    return true;
  }

  _addChild(child, index) {
    if (!this._acceptChild(child)) {
      throw new Error(child + ' could not be appended to ' + this);
    }
    if (!this.$children) {
      this.$children = [];
    }
    if (typeof index === 'number') {
      this.$children.splice(index, 0, child);
    } else {
      index = this.$children.push(child) - 1;
    }
    super._trigger('addChild', {child, index});
  }

  _removeChild(child) {
    if (this.$children) {
      let index = this.$children.indexOf(child);
      if (index !== -1) {
        this.$children.splice(index, 1);
        super._trigger('removeChild', {child, index});
      }
    }
  }

  _release() {
    if (this.$children) {
      let children = this.$children.concat();
      for (let i = 0; i < children.length; i++) {
        children[i]._dispose(true);
      }
      delete this.$children;
    }
    super._release();
  }

  _flushLayout() {
    if (this.$children) {
      this.$children.forEach((child) => {
        this._renderLayoutData.call(child);
      });
    }
  }

  _renderLayoutData() {
    if (this._layoutData) {
      let checkedData = Layout.checkConsistency(this._layoutData);
      this._nativeSet('layoutData', Layout.resolveReferences(checkedData, this));
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, props, children) {
    const result = super[jsxFactory](Type, props);
    return result.append(this.normalizeChildren(children));
  }

}

NativeObject.defineProperties(Composite.prototype, {
  padding: {
    type: 'boxDimensions',
    default: {left: 0, right: 0, top: 0, bottom: 0}
  }
});

function asArray(value) {
  if (!value) {
    return [];
  }
  if (value instanceof WidgetCollection) {
    return value.toArray();
  }
  return value;
}

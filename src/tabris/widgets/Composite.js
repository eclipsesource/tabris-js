import Widget from '../Widget';
import NativeObject from '../NativeObject';
import {createSelectorArray, getSelectorSpecificity} from '../util-widget-select';
import Layout, {ConstraintLayout} from '../Layout';
import WidgetCollection from '../WidgetCollection';
import {omit} from '../util';
import {jsxFactory} from '../JsxProcessor';
import {toXML} from '../Console';

export default class Composite extends Widget {

  append() {
    this._checkDisposed();
    const accept = (/** @type {Widget} */ widget) => {
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
    const scope = new WidgetCollection(
      asArray(this.children()).concat(this), {selector: '*', origin: this, deep: true}
    );
    return this._apply(sheet, scope);
  }

  children(selector) {
    return this._children(selector);
  }

  set(props) {
    if (('children' in props) && !(props.children instanceof Function)) {
      throw new Error('You may not override children with a non-function');
    }
    return super.set(props);
  }

  _nativeCreate(properties) {
    super._nativeCreate(omit(properties || {}, ['layout']));
    this._initLayout(properties);
  }

  /**
   * @param {any} props
   */
  _initLayout(props = {}) {
    if (!('layout' in props)) {
      this._layout = ConstraintLayout.default;
    } else if (props.layout) {
      this._layout = props.layout;
    } else {
      this._layout = null;
    }
    if (this._layout) {
      this._checkLayout(this._layout);
      this._layout.add(this);
    }
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

  // eslint-disable-next-line no-unused-vars
  _acceptChild(child) {
    return true;
  }

  _checkLayout(value) {
    if (value && !(value instanceof Layout)) {
      throw new Error('Not an instance of "Layout"');
    }
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
    this._scheduleRenderChildren();
    super._trigger('addChild', {child, index});
  }

  _removeChild(child) {
    if (this.$children) {
      const index = this.$children.indexOf(child);
      if (index !== -1) {
        this.$children.splice(index, 1);
        this._scheduleRenderChildren();
        super._trigger('removeChild', {child, index});
      }
    }
  }

  _release() {
    if (this.$children) {
      const children = this.$children.concat();
      for (let i = 0; i < children.length; i++) {
        children[i]._dispose(true);
      }
      delete this.$children;
    }
    if (this._layout) {
      this._layout.remove(this);
    }
    super._release();
  }

  _getXMLContent() {
    const content = super._getXMLContent();
    for (let i = 0; i < (this.$children || []).length; ++i) {
      content.push(this.$children[i][toXML]().split('\n').map(line => '  ' + line).join('\n'));
    }
    return content;
  }

  _scheduleRenderChildren() {
    tabris.once('layout', this._flushChildren, this);
  }

  _flushChildren() {
    if (this.$children) {
      this._nativeSet('children', this.$children.filter(notExcluded).map(toCid));
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const normalAttributes = this.withoutChildren(attributes);
    const result = super[jsxFactory](Type, normalAttributes);
    if (children && children.length) {
      result.append(children);
    }
    return result;
  }

}

NativeObject.defineProperties(Composite.prototype, {
  layout: {
    readonly: true,
    get() {
      return this._layout;
    }
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

function toCid(widget) {
  return widget.cid;
}

function notExcluded(widget) {
  return !widget.excludeFromLayout;
}

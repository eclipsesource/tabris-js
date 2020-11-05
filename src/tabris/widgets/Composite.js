import Widget from '../Widget';
import NativeObject from '../NativeObject';
import Layout, {ConstraintLayout} from '../Layout';
import WidgetCollection from '../WidgetCollection';
import {omit} from '../util';
import {JSX} from '../JsxProcessor';
import {toXML, toValueString, hint} from '../Console';
import {apply} from './util-apply';
import checkType from '../checkType';

export default class Composite extends Widget {

  get layout() {
    return this._layout;
  }

  set layout(value) {
    hint(this, 'Can not set read-only property "layout"');
  }

  append() {
    this._checkDisposed();
    const accept = (/** @type {Widget} */ widget) => {
      if (!(widget instanceof NativeObject)) {
        throw new Error(`Cannot append non-widget ${toValueString(widget)} to ${this}`);
      }
      if (widget === this) {
        throw new Error(`Cannot append widget ${this} to itself`);
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

  /**
   * @param {object|string} arg1
   * @param {object=} arg2
   */
  apply(arg1, arg2) {
    return apply({host: this, args: arguments, protected: false});
  }

  /** @param {any=} selector */
  children(selector) {
    return this._children(selector);
  }

  set(props) {
    if (props && ('children' in props) && !(props.children instanceof Function)) {
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
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: ConstraintLayout.default}
      );
    } else if (props.layout) {
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: props.layout}
      );
    } else {
      Object.defineProperty(
        this, '_layout', {enumerable: false, writable: false, value: null}
      );
    }
    if (this._layout) {
      this._checkLayout(this._layout);
      this._layout.add(this);
    }
  }

  /**
   * @param {any=} selector
   */
  _children(selector) {
    return new WidgetCollection(this.$children, {selector, origin: this});
  }

  _find(selector) {
    return new WidgetCollection(this._children(), {selector, origin: this, deep: true});
  }

  /**
   * @param {object|string} arg1
   * @param {object=} arg2
   */
  _apply(arg1, arg2, arg3) {
    return apply({host: this, args: arguments, protected: true});
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
      throw new Error(`${toValueString(value)} is not an instance of Layout`);
    }
  }

  _addChild(child, index) {
    if (!this._acceptChild(child)) {
      throw new Error(`${toValueString(child)} could not be appended to ${this}`);
    }
    if (!this.$children) {
      Object.defineProperties(this, {
        $children: {enumerable: false, writable: true, value: []}
      });
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
      this.$children = undefined;
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
    tabris.once('layout', this.$flushChildren, this);
  }

  $flushChildren() {
    if (this.$children) {
      this._nativeSet('children', this.$children.filter(notExcluded).map(toCid));
    }
  }

  /** @this {import("../JsxProcessor").default} */
  [JSX.jsxFactory](Type, attributes) {
    const children = this.getChildren(attributes);
    const {apply: ruleSets, ...normalAttributes} = this.withoutChildren(attributes);
    const result = super[JSX.jsxFactory](Type, normalAttributes);
    if (children && children.length) {
      result.append(children);
    }
    if (ruleSets) {
      checkType(ruleSets, Array, {name: 'apply'});
      ruleSets.forEach(rules =>
        result.apply({
          mode: 'strict',
          trigger: rules instanceof Function ? '*' : 'rules'
        }, rules)
      );
    }
    return result;
  }

}

function toCid(widget) {
  return widget.cid;
}

function notExcluded(widget) {
  return !widget.excludeFromLayout;
}

import Widget from '../Widget';
import NativeObject from '../NativeObject';
import Layout, {ConstraintLayout} from '../Layout';
import WidgetCollection from '../WidgetCollection';
import {asArray, omit} from '../util';
import JsxProcessor from '../JsxProcessor';
import {toValueString, hint} from '../Console';
import {apply} from './util-apply';
import {toXML, jsxFactory} from '../symbols';

export default class Composite<
  ChildType extends Widget = Widget,
  TData extends object = any
> extends Widget<TData> {

  _layout!: Layout;
  $children?: ChildType[];

  get layout() {
    return this._layout;
  }

  set layout(value) {
    hint(this, 'Can not set read-only property "layout"');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  append(..._children: any[]) {
    this._checkDisposed();
    const accept = (widget: Widget) => {
      if (!(widget instanceof NativeObject)) {
        throw new Error(`Cannot append non-widget ${toValueString(widget)} to ${this}`);
      }
      if (widget === (this as any)) {
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

  find(selector?: Selector): WidgetCollection {
    return new WidgetCollection(this.children(), {selector, origin: this as Widget, deep: true});
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_arg1: object | string, _arg2?: object): this {
    return apply({host: this, args: arguments, protected: false}) as this;
  }

  children(selector?: Selector): WidgetCollection {
    return this._children(selector);
  }

  set(props: Props<this>) {
    if (props && ('children' in props) && !(props.children instanceof Function)) {
      throw new Error('You may not override children with a non-function');
    }
    return super.set(props);
  }

  _nativeCreate(properties: any) {
    super._nativeCreate(omit(properties || {}, ['layout']));
    this._initLayout(properties);
  }

  _initLayout(props: any = {}) {
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

  _children(selector?: Selector) {
    return new WidgetCollection(this.$children, {selector, origin: this as Widget});
  }

  _find(selector: Selector) {
    return new WidgetCollection(this._children(), {selector, origin: this as Widget, deep: true});
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _apply(_arg1: object|string, _arg2?: object, _arg3?: any): this {
    return apply({host: this, args: arguments, protected: true}) as this;
  }

  get _nativeType() {
    return 'tabris.Composite';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _acceptChild(_child: ChildType) {
    return true;
  }

  _checkLayout(value: Layout) {
    if (value && !(value instanceof Layout)) {
      throw new Error(`${toValueString(value)} is not an instance of Layout`);
    }
  }

  _addChild(child: ChildType, index?: number) {
    if (!this._acceptChild(child)) {
      throw new Error(`${toValueString(child)} could not be appended to ${this}`);
    }
    if (!this.$children) {
      Object.defineProperties(this, {
        $children: {enumerable: false, writable: true, value: []}
      });
    }
    if (typeof index === 'number') {
      this.$children!.splice(index, 0, child);
    } else {
      index = this.$children!.push(child) - 1;
    }
    this._scheduleRenderChildren();
    super._trigger('addChild', {child, index});
  }

  _removeChild(child: ChildType) {
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
      for (const child of children) {
        const skipNative = !child.excludeFromLayout;
        child._dispose(skipNative);
      }
      this.$children = undefined;
    }
    if (this._layout) {
      this._layout.remove(this);
    }
    super._release();
  }

  _getXMLContent() {
    const content: string[] = super._getXMLContent();
    for (let i = 0; i < (this.$children || []).length; ++i) {
      content.push(this.$children![i][toXML]().split('\n').map(line => '  ' + line).join('\n'));
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

  // @ts-ignore
  [jsxFactory](this: JsxProcessor, Type: Constructor<Widget>, attributes: object) {
    const children = this.getChildren(attributes);
    const {apply: ruleSets, ...normalAttributes} = this.withoutChildren(attributes) as {apply: {}};
    const result = super[jsxFactory](Type, normalAttributes) as Composite;
    if (children && children.length) {
      result.append(children);
    }
    if (ruleSets) {
      asArray(ruleSets).forEach(rules =>
        result.apply({
          mode: 'strict',
          trigger: rules instanceof Function ? '*' : 'rules'
        }, rules)
      );
    }
    return result;
  }

}

function toCid(widget: Widget) {
  return widget.cid;
}

function notExcluded(widget: Widget) {
  return !widget.excludeFromLayout;
}

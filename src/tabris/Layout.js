import {types} from './property-types';
import {warn, toValueString} from './Console';
import LayoutData from './LayoutData';
import Constraint from './Constraint';
import Percent from './Percent';

const layoutDataProps = ['left', 'right', 'top', 'bottom', 'width', 'height', 'centerX', 'centerY', 'baseline'];

export default class Layout {

  // eslint-disable-next-line no-unused-vars
  constructor(properties = {}, queue) {
    if (this.constructor === Layout) {
      throw new Error('Can not create instance of abstract class "Layout"');
    }
    this._layoutQueue = queue || LayoutQueue.instance;
    if (!(this._layoutQueue instanceof LayoutQueue)) {
      throw new Error('Not a LayoutQueue: ' + this._layoutQueue);
    }
    this._handleAddChildEvent = this._handleAddChildEvent.bind(this);
    this._handleRemoveChildEvent = this._handleRemoveChildEvent.bind(this);
    this._handleChildPropertyChangedEvent = this._handleChildPropertyChangedEvent.bind(this);
    this._getLayoutData = this._getLayoutData.bind(this);
    this._renderLayoutData = this._renderLayoutData.bind(this);
    this._addChild = this._addChild.bind(this);
    this._removeChild = this._removeChild.bind(this);
  }

  add(composite) {
    if (!composite || composite.layout !== this) {
      throw new Error(`Invalid layout target ${toValueString(composite)}. Do not call layout.add directly.`);
    }
    composite.on({
      addChild: this._handleAddChildEvent,
      removeChild: this._handleRemoveChildEvent
    });
    if (composite.$children) {
      composite.$children.forEach(this._addChild);
    }
    this._layoutQueue.add(composite);
  }

  remove(composite) {
    composite.off({
      addChild: this._handleAddChildEvent,
      removeChild: this._handleRemoveChildEvent
    });
    if (composite.$children) {
      composite.$children.forEach(this._removeChild);
    }
  }

  render(composite) {
    const children = getChildrenInLayout(composite);
    if (!children.length) {
      return;
    }
    const allLayoutData = children.map(this._getLayoutData);
    this._renderLayoutData(children, allLayoutData);
  }

  _handleAddChildEvent({child}) {
    this._addChild(child);
    this._layoutQueue.add(child._parent);
  }

  _handleRemoveChildEvent({child}) {
    this._removeChild(child);
    this._layoutQueue.add(child._parent);
  }

  _addChild(child) {
    child.on({
      layoutDataChanged: this._handleChildPropertyChangedEvent,
      excludeFromLayoutChanged: this._handleChildPropertyChangedEvent
    });
  }

  _removeChild(child) {
    child.off({
      layoutDataChanged: this._handleChildPropertyChangedEvent,
      excludeFromLayoutChanged: this._handleChildPropertyChangedEvent
    });
  }

  _handleChildPropertyChangedEvent({target}) {
    this._layoutQueue.add(target._parent);
  }

  /**
   * @param {Array<import('./Widget').default>} children
   * @param {Array<LayoutData>} allLayoutData
   */
  _renderLayoutData(children, allLayoutData) {
    for (let i = 0; i < children.length; i++) {
      const rawLayoutData = this._resolveAttributes(allLayoutData[i], children[i]);
      children[i]._nativeSet('layoutData', rawLayoutData);
    }
  }

  /**
   * @param {import('./Widget').default} child
   * @param {number} index
   */
  // eslint-disable-next-line no-unused-vars
  _getLayoutData(child, index) {
    let result = child.layoutData;
    if (result.centerX !== 'auto') {
      if (result.left !== 'auto' || result.right !== 'auto') {
        warn('Inconsistent layoutData: centerX overrides left and right.\nTarget: ' + getPath(child));
        result = makeAuto(result, 'left', 'right');
      }
    }
    if (result.baseline !== 'auto') {
      if (result.top !== 'auto' || result.bottom !== 'auto' || result.centerY !== 'auto') {
        warn('Inconsistent layoutData: baseline overrides top, bottom, and centerY.\nTarget: ' + getPath(child));
        result = makeAuto(result, 'top', 'bottom', 'centerY');
      }
    } else if (result.centerY !== 'auto') {
      if (result.top !== 'auto' || result.bottom !== 'auto') {
        warn('Inconsistent layoutData: centerY overrides top and bottom.\nTarget: ' + getPath(child));
        result = makeAuto(result, 'top', 'bottom');
      }
    }
    if (result.left !== 'auto' && result.right !== 'auto' && result.width !== 'auto') {
      warn('Inconsistent layoutData: left and right are set, ignore width.\nTarget: ' + getPath(child));
      result = makeAuto(result, 'width');
    }
    if (result.top !== 'auto' && result.bottom !== 'auto' && result.height !== 'auto') {
      warn('Inconsistent layoutData: top and bottom are set, ignore height.\nTarget: ' + getPath(child));
      result = makeAuto(result, 'height');
    }
    const property = ['left', 'top', 'right', 'bottom'].find(prop => result[prop].offset && result[prop].offset < 0);
    if (property) {
      warn('Negative edge offsets are not supported. Setting ' + property + ' to 0.\nTarget: '  + getPath(child));
      const normalizedPropertyValue = Object.assign({}, result[property], {offset: 0});
      result = LayoutData.from(Object.assign({}, result, {[property]: normalizedPropertyValue}));
    }
    return result;
  }

  /**
   * @param {LayoutData} layoutData
   * @param {import('./Widget').default} targetWidget
   */
  _resolveAttributes(layoutData, targetWidget) {
    const result = {};
    for (let i = 0; i < layoutDataProps.length; i++) {
      const prop = layoutDataProps[i];
      if (prop in layoutData && layoutData[prop] !== 'auto') {
        result[prop] = resolveAttribute(layoutData[prop], targetWidget);
      }
    }
    return result;
  }

}

export class ConstraintLayout extends Layout {

  static get default() {
    if (!this._default) {
      this._default = new ConstraintLayout();
    }
    return this._default;
  }

}

export class LayoutQueue {

  static get instance () {
    if (!this._instance) {
      this._instance = new LayoutQueue();
      tabris.on('layout', () => this._instance.flush());
    }
    return this._instance;
  }

  constructor() {
    this._map = {};
    this._inFlush = false;
  }

  add(composite) {
    this._map[composite.cid] = composite;
  }

  flush() {
    if (this._inFlush) {
      throw new Error('flush in flush');
    }
    this._inFlush = true;
    for (const cid in this._map) {
      if (!this._map[cid]._isDisposed && this._map[cid].layout) {
        this._map[cid].layout.render(this._map[cid]);
      }
    }
    this._map = {};
    this._inFlush = false;
  }

}

export function getPath(widget) {
  const path = [widget];
  let parent = widget.parent();
  while (parent) {
    path.unshift(parent);
    parent = parent.parent();
  }
  return path.join(' > ');
}

function resolveAttribute(value, widget) {
  if (value instanceof Constraint) {
    return resolveConstraint(value, widget);
  }
  if (isNumber(value)) {
    return value;
  }
  return toCid(value, widget);
}

function resolveConstraint(constraint, widget) {
  if (constraint.reference instanceof Percent) {
    if (constraint.reference.percent === 0) {
      return constraint.offset;
    }
    return [constraint.reference.percent, constraint.offset];
  }
  return [toCid(constraint.reference, widget), constraint.offset];
}

function toCid(ref, widget) {
  if (ref === LayoutData.prev) {
    const children = getChildrenInLayout(getParent(widget));
    const index = children.indexOf(widget);
    if (index > 0) {
      return types.NativeObject.encode(children[index - 1]) || 0;
    }
    return 0;
  }
  if (ref === LayoutData.next) {
    const children = getChildrenInLayout(getParent(widget));
    const index = children.indexOf(widget);
    if (index + 1 < children.length) {
      return types.NativeObject.encode(children[index + 1]) || 0;
    }
    return 0;
  }
  if (typeof ref === 'string') {
    const sibling = widget.siblings(ref)[0];
    return types.NativeObject.encode(sibling) || 0;
  }
  if (widget.siblings().toArray().includes(ref)) {
    return types.NativeObject.encode(ref) || 0;
  }
  return 0;
}

function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

function getParent(widget) {
  return widget.parent() || emptyParent;
}

function makeAuto(layoutData, ...props) {
  const override = {};
  for (let i = 0; i < props.length; i++) {
    override[props[i]] = 'auto';
  }
  return LayoutData.from(Object.assign({}, layoutData, override));
}

function getChildrenInLayout(parent) {
  return parent.$children ? parent.$children.filter(notExcluded) : [];
}

function notExcluded(widget) {
  return !widget.excludeFromLayout;
}

const emptyParent = {
  children() {
    return [];
  }
};

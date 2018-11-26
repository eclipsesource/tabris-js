import {types} from './property-types';
import {warn} from './Console';
import LayoutData from './LayoutData';
import Constraint from './Constraint';
import Percent from './Percent';

const layoutDataProps = ['left', 'right', 'top', 'bottom', 'width', 'height', 'centerX', 'centerY', 'baseline'];
const edges = ['left', 'top', 'right', 'bottom'];

export default class Layout {

  constructor(properties = {}, queue) {
    if (this.constructor === Layout) {
      throw new Error('Can not create instance of abstract class "Layout"');
    }
    this._layoutQueue = queue || LayoutQueue.instance;
    if (!(this._layoutQueue instanceof LayoutQueue)) {
      throw new Error('Not a LayoutQueue: ' + this._layoutQueue);
    }
    this._padding = types.boxDimensions.encode('padding' in properties ? properties.padding : 0);
    this._handleAddChildEvent = this._handleAddChildEvent.bind(this);
    this._handleRemoveChildEvent = this._handleRemoveChildEvent.bind(this);
    this._handleChildLayoutDataChangedEvent = this._handleChildLayoutDataChangedEvent.bind(this);
    this._renderLayoutData = this._renderLayoutData.bind(this);
    this._addChild = this._addChild.bind(this);
    this._removeChild = this._removeChild.bind(this);
  }

  get padding() {
    return Object.assign({}, this._padding);
  }

  add(composite) {
    if (!composite || composite.layout !== this) {
      throw new Error(`Invalid layout target ${composite}. Do not call layout.add directly.`);
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
    if (composite.$children) {
      composite.$children.forEach(this._renderLayoutData);
    }
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
      layoutDataChanged: this._handleChildLayoutDataChangedEvent
    });
  }

  _removeChild(child) {
    child.off({
      layoutDataChanged: this._handleChildLayoutDataChangedEvent
    });
  }

  _handleChildLayoutDataChangedEvent({target}) {
    this._layoutQueue.add(target._parent);
  }

  _renderLayoutData(child, index) {
    const layoutData = this._getLayoutData(child, index);
    const rawLayoutData = this._getRawLayoutData(layoutData, child, index);
    child._nativeSet('layoutData', rawLayoutData);
  }

  _getLayoutData(child) {
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
    return result;
  }

  _getRawLayoutData(layoutData, targetWidget) {
    const result = this._resolveAttributes(layoutData, targetWidget);
    this._addPadding(result);
    return result;
  }

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

  _addPadding(rawLayoutData) {
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const value = rawLayoutData[edge];
      if (typeof value === 'number') {
        rawLayoutData[edge] += this._padding[edge];
      } else if (value instanceof Array && (typeof rawLayoutData[edge][0] === 'number')) {
        rawLayoutData[edge][1] += this._padding[edge];
      }
    }
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
  }

  add(composite) {
    this._map[composite.cid] = composite;
  }

  flush() {
    for (const cid in this._map) {
      if (!this._map[cid]._isDisposed && this._map[cid].layout) {
        this._map[cid].layout.render(this._map[cid]);
      }
    }
    this._map = {};
  }

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
    const children = getParent(widget)._children();
    const index = children.indexOf(widget);
    if (index > 0) {
      return types.NativeObject.encode(children[index - 1]) || 0;
    }
    return 0;
  }
  if (ref === LayoutData.next) {
    const children = getParent(widget)._children();
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

function getPath(widget) {
  const path = [widget];
  let parent = widget.parent();
  while (parent) {
    path.unshift(parent);
    parent = parent.parent();
  }
  return path.join(' > ');
}

const emptyParent = {
  children() {
    return [];
  }
};

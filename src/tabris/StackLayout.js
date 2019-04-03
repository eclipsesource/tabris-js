import Layout, {getPath} from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';
import Constraint from './Constraint';
import Percent from './Percent';
import {warn} from './Console';

const Align = {
  left: 'left',
  centerX: 'centerX',
  right: 'right',
  stretchX: 'stretchX'
};

const zero = new Percent(0);

export default class StackLayout extends Layout {

  static get default() {
    if (!this._default) {
      this._default = new StackLayout();
    }
    return this._default;
  }

  constructor(properties = {}, queue) {
    super({}, queue);
    this._spacing = 'spacing' in properties ? types.number.encode(properties.spacing) : 0;
    this._alignment = Align[properties.alignment] || Align.left;
    const align = this._alignment;
    this._layoutDataHorizontal = LayoutData.from({
      left: (align === Align.left || align === Align.stretchX) ? 0 : 'auto',
      right: (align === Align.right || align === Align.stretchX) ? 0 : 'auto',
      centerX: (align === Align.centerX) ? 0 : 'auto'
    });
  }

  get spacing() {
    return this._spacing;
  }

  get alignment() {
    return this._alignment;
  }

  _getLayoutData(child) {
    const result = child.layoutData;
    ['left', 'top', 'right', 'bottom']
      .filter(prop => !isValidConstraint(result[prop]))
      .forEach(prop => layoutWarn(child, prop, 'StackLayout only supports "auto" and numeric offset.'));
    ['centerY', 'baseline']
      .filter(prop => result[prop] !== 'auto')
      .forEach(prop => layoutWarn(child, prop, 'StackLayout only supports "auto".'));
    if (result.centerX !== 'auto' && (result.left !== 'auto' || result.right !== 'auto')) {
      warn('Inconsistent layoutData: centerX overrides left and right.\nTarget: ' + getPath(child));
    }
    if (result.left !== 'auto' && result.right !== 'auto' && result.width !== 'auto') {
      warn('Inconsistent layoutData: left and right are set, ignore width.\nTarget: ' + getPath(child));
    }
    return result;
  }

  /**
   * @param {Array<import('./Widget').default>} children
   * @param {Array<LayoutData>} allLayoutData
   */
  _renderLayoutData(children, allLayoutData) {
    const stretchIndex = this._findStretchIndex(allLayoutData);
    let alignTop = true;
    for (let i = 0; i < children.length; i++) {
      const targetLayoutData = Object.assign({}, this._layoutDataHorizontal);
      this._layoutX(allLayoutData[i], targetLayoutData);
      this._applyHeight(allLayoutData[i], targetLayoutData);
      if (alignTop) {
        this._applyTop(targetLayoutData, allLayoutData, i);
      }
      if (i === stretchIndex) {
        alignTop = false;
        targetLayoutData.height = 'auto';
      }
      if (!alignTop) {
        this._applyBottom(targetLayoutData, allLayoutData, i);
      }
      children[i]._nativeSet('layoutData', this._resolveAttributes(targetLayoutData, children[i]));
    }
  }

  _layoutX(layoutData, targetLayoutData) {
    if (layoutData.left !== 'auto' || layoutData.right !== 'auto' || layoutData.centerX !== 'auto') {
      if (layoutData.centerX !== 'auto') {
        Object.assign(targetLayoutData, {left: 'auto', right: 'auto', centerX: layoutData.centerX});
      } else {
        Object.assign(targetLayoutData, {
          left: layoutData.left !== 'auto' ? new Constraint(zero, layoutData.left.offset) : 'auto',
          right: layoutData.right !== 'auto' ? new Constraint(zero, layoutData.right.offset) : 'auto',
          centerX: 'auto'
        });
      }
    }
    if (layoutData.width !== 'auto' && (layoutData.left === 'auto' || layoutData.right === 'auto')) {
      targetLayoutData.width = layoutData.width;
      if (this._alignment === Align.stretchX) {
        targetLayoutData.right = 'auto';
      }
    }
  }

  _applyTop(targetLayoutData, allLayoutData, index) {
    const top = allLayoutData[index].top;
    const prevLayoutData = allLayoutData[index - 1];
    const prevBottom = prevLayoutData ? prevLayoutData.bottom : 'auto';
    const ref = prevLayoutData ? LayoutData.prev : zero;
    if (top === 'auto' && prevBottom === 'auto') {
      targetLayoutData.top = new Constraint(
        ref,
        prevLayoutData ? this._spacing : 0
      );
    } else {
      targetLayoutData.top = new Constraint(ref, maxPositive(
        top !== 'auto' ? top.offset : 0,
        prevBottom !== 'auto' ? prevBottom.offset : 0
      ));
    }
  }

  _applyBottom(targetLayoutData, allLayoutData, index) {
    const bottom = allLayoutData[index].bottom;
    const nextLayoutData = allLayoutData[index + 1];
    const nextTop = nextLayoutData ? nextLayoutData.top : 'auto';
    const ref = nextLayoutData ? LayoutData.next : zero;
    if (bottom === 'auto' && nextTop === 'auto') {
      targetLayoutData.bottom = new Constraint(ref, nextLayoutData ? this._spacing : 0);
    } else {
      targetLayoutData.bottom = new Constraint(ref, maxPositive(
        bottom !== 'auto' ? bottom.offset : 0,
        nextTop !== 'auto' ? nextTop.offset : 0
      ));
    }
  }

  _applyHeight(layoutData, targetLayoutData) {
    if (layoutData.height !== 'auto') {
      targetLayoutData.height = layoutData.height;
    }
  }

  _findStretchIndex(allLayoutData) {
    for (let i = 0; i < allLayoutData.length; i++) {
      const {top, height, bottom} = allLayoutData[i];
      if (top !== 'auto' && height === 'auto' && bottom !== 'auto') {
        return i;
      }
    }
    return -1;
  }

  _valignTop(allLayoutData) {
    return allLayoutData[0].top !== 'auto';
  }

  _valignBottom(allLayoutData) {
    return allLayoutData[allLayoutData.length - 1].bottom !== 'auto';
  }

}

function isValidConstraint(constraint) {
  if (constraint === 'auto') {
    return true;
  }
  if (constraint.reference instanceof Percent && constraint.reference.percent === 0) {
    return true;
  }
  return false;
}

function layoutWarn(child, prop, message) {
  warn(`Unsupported value for "${prop}": ${message}\nTarget: ${getPath(child)}`);
}

/**
 * @param {number} value1
 * @param {number} value2
 * @return {number}
 */
function maxPositive(value1, value2) {
  if (value1 < 0 || value2 < 0) {
    return 0;
  }
  return Math.max(0, Math.max(value1, value2));
}

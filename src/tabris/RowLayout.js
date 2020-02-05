import Layout, {isValidConstraint, maxPositive, layoutWarn, getPath} from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';
import Constraint from './Constraint';
import Percent from './Percent';
import {warn} from './Console';

const Align = {
  top: 'top',
  centerY: 'centerY',
  baseline: 'baseline',
  bottom: 'bottom',
  stretchY: 'stretchY'
};

const zero = new Percent(0);

export default class RowLayout extends Layout {

  static get default() {
    if (!this._default) {
      Object.defineProperty(this, '_default', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: new RowLayout()
      });
    }
    return this._default;
  }

  constructor(properties = {}, queue) {
    super({}, queue);
    const align = Align[properties.alignment] || Align.top;
    Object.defineProperties(this, {
      _spacing: {
        enumerable: false,
        writable: false,
        value: 'spacing' in properties ? types.number.convert(properties.spacing) : 0
      },
      _alignment: {
        enumerable: false,
        writable: false,
        value: align
      },
      _layoutDataVertical: {
        enumerable: false,
        writable: false,
        value: LayoutData.from({
          top: (align === Align.top || align === Align.stretchY) ? 0 : 'auto',
          bottom: (align === Align.bottom || align === Align.stretchY) ? 0 : 'auto',
          centerY: (align === Align.centerY) ? 0 : 'auto',
          baseline: (align === Align.baseline) ? Constraint.prev : 'auto'
        })
      }
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
      .forEach(prop => layoutWarn(child, prop, 'RowLayout only supports "auto" and numeric offset.'));
    ['centerX']
      .filter(prop => result[prop] !== 'auto')
      .forEach(prop => layoutWarn(child, prop, 'StackLayout only supports "auto".'));
    if (result.centerY !== 'auto'
      && (result.top !== 'auto' || result.bottom !== 'auto' || result.baseline !== 'auto')
    ) {
      warn('Inconsistent layoutData: centerY overrides top, bottom and baseline.\nTarget: ' + getPath(child));
    } else if (result.baseline !== 'auto' && (result.top !== 'auto' || result.bottom !== 'auto')) {
      warn('Inconsistent layoutData: baseline overrides top and bottom.\nTarget: ' + getPath(child));
    }

    if (result.top !== 'auto' && result.bottom !== 'auto' && result.height !== 'auto') {
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
    let alignLeft = true;
    for (let i = 0; i < children.length; i++) {
      const targetLayoutData = Object.assign({}, this._layoutDataVertical);
      this._layoutY(targetLayoutData, allLayoutData, i);
      this._applyWidth(allLayoutData[i], targetLayoutData);
      if (alignLeft) {
        this._applyLeft(targetLayoutData, allLayoutData, i);
      }
      if (i === stretchIndex) {
        alignLeft = false;
        targetLayoutData.width = 'auto';
      }
      if (!alignLeft) {
        this._applyRight(targetLayoutData, allLayoutData, i);
      }
      children[i]._nativeSet('layoutData', this._resolveAttributes(targetLayoutData, children[i]));
    }
  }

  _layoutY(targetLayoutData, allLayoutData, index) {
    const layoutData = allLayoutData[index];
    if (layoutData.top !== 'auto'
      || layoutData.bottom !== 'auto'
      || layoutData.centerY !== 'auto'
      || layoutData.baseline !== 'auto'
    ) {
      if (layoutData.centerY !== 'auto') {
        Object.assign(targetLayoutData, {top: 'auto', bottom: 'auto', baseline: 'auto', centerY: layoutData.centerY});
      } else if (layoutData.baseline !== 'auto') {
        Object.assign(targetLayoutData, {top: 'auto', bottom: 'auto', baseline: layoutData.baseline});
      } else {
        Object.assign(targetLayoutData, {
          top: layoutData.top !== 'auto' ? new Constraint(zero, layoutData.top.offset) : 'auto',
          bottom: layoutData.bottom !== 'auto' ? new Constraint(zero, layoutData.bottom.offset) : 'auto',
          centerY: 'auto',
          baseline: 'auto'
        });
      }
    } else if (index === 0 && targetLayoutData.baseline !== 'auto') {
      targetLayoutData.baseline = 'auto';
      targetLayoutData.top = 0;
    }
    if (layoutData.height !== 'auto' && (layoutData.top === 'auto' || layoutData.bottom === 'auto')) {
      targetLayoutData.height = layoutData.height;
      if (this._alignment === Align.stretchY) {
        targetLayoutData.bottom = 'auto';
      }
    }
  }

  _applyLeft(targetLayoutData, allLayoutData, index) {
    const left = allLayoutData[index].left;
    const prevLayoutData = allLayoutData[index - 1];
    const prevRight = prevLayoutData ? prevLayoutData.right : 'auto';
    const ref = prevLayoutData ? LayoutData.prev : zero;
    if (left === 'auto' && prevRight === 'auto') {
      targetLayoutData.left = new Constraint(
        ref,
        prevLayoutData ? this._spacing : 0
      );
    } else {
      targetLayoutData.left = new Constraint(ref, maxPositive(
        left !== 'auto' ? left.offset : 0,
        prevRight !== 'auto' ? prevRight.offset : 0
      ));
    }
  }

  _applyRight(targetLayoutData, allLayoutData, index) {
    const right = allLayoutData[index].right;
    const nextLayoutData = allLayoutData[index + 1];
    const nextLeft = nextLayoutData ? nextLayoutData.left : 'auto';
    const ref = nextLayoutData ? LayoutData.next : zero;
    if (right === 'auto' && nextLeft === 'auto') {
      targetLayoutData.right = new Constraint(ref, nextLayoutData ? this._spacing : 0);
    } else {
      targetLayoutData.right = new Constraint(ref, maxPositive(
        right !== 'auto' ? right.offset : 0,
        nextLeft !== 'auto' ? nextLeft.offset : 0
      ));
    }
  }

  _applyWidth(layoutData, targetLayoutData) {
    if (layoutData.width !== 'auto') {
      targetLayoutData.width = layoutData.width;
    }
  }

  _findStretchIndex(allLayoutData) {
    for (let i = 0; i < allLayoutData.length; i++) {
      const {left, width, right} = allLayoutData[i];
      if (left !== 'auto' && width === 'auto' && right !== 'auto') {
        return i;
      }
    }
    return -1;
  }

}

import Layout from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';
import Constraint from './Constraint';

const Align = {
  left: 'left',
  centerX: 'centerX',
  right: 'right',
  stretchX: 'stretchX'
};

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
    const baseData = {
      left: (align === Align.left || align === Align.stretchX) ? 0 : 'auto',
      right: (align === Align.right || align === Align.stretchX) ? 0 : 'auto',
      top: [LayoutData.prev, this._spacing],
      centerX: (align === Align.centerX) ? 0 : 'auto'
    };
    this._firstLayoutData = LayoutData.from(Object.assign({}, baseData, {top: 0}));
    this._defaultLayoutData = LayoutData.from(baseData);
  }

  get spacing() {
    return this._spacing;
  }

  get alignment() {
    return this._alignment;
  }

  _getLayoutData(child) {
    return child.layoutData;
  }

  /**
   * @param {Array<import('./Widget').default>} children
   * @param {Array<LayoutData>} allLayoutData
   * @param {number} index
   */
  _getRawLayoutData(children, allLayoutData, index) {
    const targetWidget = children[index];
    const layoutData = allLayoutData[index];
    const prevLayoutData = allLayoutData[index - 1] || {bottom: 'auto'};
    const targetLayoutData = Object.assign({}, index === 0 ? this._firstLayoutData : this._defaultLayoutData);
    this.applyLayoutDataX(layoutData, targetLayoutData);
    this.applyLayoutDataY(layoutData, targetLayoutData, prevLayoutData);
    return super._resolveAttributes(targetLayoutData, targetWidget);
  }

  applyLayoutDataX(layoutData, targetLayoutData) {
    if (layoutData.left !== 'auto' || layoutData.right !== 'auto' || layoutData.centerX !== 'auto') {
      targetLayoutData.left = layoutData.left;
      targetLayoutData.right = layoutData.right;
      targetLayoutData.centerX = layoutData.centerX;
    }
    if (layoutData.width !== 'auto') {
      targetLayoutData.width = layoutData.width;
      if (this._alignment === Align.stretchX) {
        targetLayoutData.right = 'auto';
      }
    }
  }

  applyLayoutDataY(layoutData, targetLayoutData, prevLayoutData) {
    if (layoutData.height !== 'auto') {
      targetLayoutData.height = layoutData.height;
    }
    if (layoutData.top !== 'auto' || prevLayoutData.bottom !== 'auto') {
      const prevBottom = prevLayoutData.bottom !== 'auto' ? prevLayoutData.bottom.offset : 0;
      const spacing = targetLayoutData.top.offset;
      const top = layoutData.top !== 'auto' ? layoutData.top.offset : 0;
      targetLayoutData.top = new Constraint(targetLayoutData.top.reference, prevBottom + spacing + top);
    }
  }

}

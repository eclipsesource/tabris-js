import Layout from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';

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
   * @param {LayoutData} layoutData
   * @param {import('./Widget').default} targetWidget
   * @param {number} index
   */
  _getRawLayoutData(layoutData, targetWidget, index) {
    const targetLayoutData = Object.assign({}, index === 0 ? this._firstLayoutData : this._defaultLayoutData);
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
    if (layoutData.height !== 'auto') {
      targetLayoutData.height = layoutData.height;
    }
    return super._resolveAttributes(targetLayoutData, targetWidget);
  }

}

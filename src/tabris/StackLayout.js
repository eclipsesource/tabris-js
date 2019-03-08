import Layout from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';
import Constraint from './Constraint';
import Percent from './Percent';

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
    return child.layoutData;
  }

  /**
   * @param {Array<import('./Widget').default>} children
   * @param {Array<LayoutData>} allLayoutData
   */
  _renderLayoutData(children, allLayoutData) {
    const stretchIndex = this._findStretchIndex(allLayoutData);
    let alignTop = this._valignTop(allLayoutData) || !this._valignBottom(allLayoutData);
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

  _applyTop(targetLayoutData, allLayoutData, index) {
    const layoutData = allLayoutData[index];
    const prevLayoutData = allLayoutData[index - 1];
    const top = layoutData.top !== 'auto' ? layoutData.top.offset : 0;
    if (!prevLayoutData) {
      targetLayoutData.top = new Constraint(zero, top);
    } else {
      const prevBottom = prevLayoutData.bottom !== 'auto' ? prevLayoutData.bottom.offset : 0;
      targetLayoutData.top = new Constraint(LayoutData.prev, prevBottom + this._spacing + top);
    }
  }

  _applyBottom(targetLayoutData, allLayoutData, index) {
    const layoutData = allLayoutData[index];
    const nextLayoutData = allLayoutData[index + 1];
    const bottom = layoutData.bottom !== 'auto' ? layoutData.bottom.offset : 0;
    if (!nextLayoutData) {
      targetLayoutData.bottom = new Constraint(zero, bottom);
    } else {
      const nextTop = nextLayoutData.top !== 'auto' ? nextLayoutData.top.offset : 0;
      targetLayoutData.bottom = new Constraint(LayoutData.next, nextTop + this._spacing + bottom);
    }
  }

  _applyHeight(layoutData, targetLayoutData) {
    if (layoutData.height !== 'auto') {
      targetLayoutData.height = layoutData.height;
    }
  }

  _findStretchIndex(allLayoutData) {
    if (!(this._valignTop(allLayoutData) && this._valignBottom(allLayoutData))) {
      return -1;
    }
    const candidates = allLayoutData.filter(layoutData => layoutData.height === 'auto');
    if (candidates.length === 0) {
      return allLayoutData.length - 1;
    }
    if (candidates.length === 1) {
      return allLayoutData.indexOf(candidates[0]);
    }
    const preferred = candidates.filter(
      layoutData => layoutData.top !== 'auto' && layoutData.bottom !== 'auto'
    );
    if (preferred.length === 0) {
      return allLayoutData.indexOf(candidates[candidates.length - 1]);
    }
    return allLayoutData.indexOf(preferred[0]);
  }

  _valignTop(allLayoutData) {
    return allLayoutData[0].top !== 'auto';
  }

  _valignBottom(allLayoutData) {
    return allLayoutData[allLayoutData.length - 1].bottom !== 'auto';
  }

}

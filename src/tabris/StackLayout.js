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
      this._default = new StackLayout({padding: 16, spacing: 16});
    }
    return this._default;
  }

  constructor(properties = {}, queue) {
    super({padding: 'padding' in properties ? properties.padding : 0}, queue);
    this._spacing = 'spacing' in properties ? types.number.encode(properties.spacing) : 0;
    this._alignment = Align[properties.alignment] || Align.left;
    const align = this._alignment;
    const baseData = {
      left: (align === Align.left || align === Align.stretchX) ? this._padding.left : 'auto',
      right: (align === Align.right || align === Align.stretchX) ? this._padding.right : 'auto',
      top: [LayoutData.prev, this._spacing],
      centerX: (align === Align.centerX) ? 0 : 'auto'
    };
    this._firstLayoutData = LayoutData.from(Object.assign({}, baseData, {
      top: this._padding.top
    }));
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

  _getRawLayoutData(layoutData, targetWidget, index) {
    const targetLayoutData = index === 0 ? this._firstLayoutData : this._defaultLayoutData;
    return super._resolveAttributes(targetLayoutData, targetWidget);
  }

}

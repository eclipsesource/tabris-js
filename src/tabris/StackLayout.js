import Layout from './Layout';
import LayoutData from './LayoutData';
import {types} from './property-types';

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
    this._firstLayoutData = LayoutData.from({
      left: this._padding.left,
      top: this._padding.top,
      right: this._padding.right
    });
    this._defaultLayoutData = LayoutData.from({
      left: this._padding.left,
      top: [LayoutData.prev, this._spacing],
      right: this._padding.right
    });
  }

  get spacing() {
    return this._spacing;
  }

  _getLayoutData(child) {
    return child.layoutData;
  }

  _getRawLayoutData(layoutData, targetWidget, index) {
    const targetLayoutData = index === 0 ? this._firstLayoutData : this._defaultLayoutData;
    return super._resolveAttributes(targetLayoutData, targetWidget);
  }

}

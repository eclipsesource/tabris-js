import Layout from './Layout';
import LayoutData from './LayoutData';

export default class ColumnLayout extends Layout {

  static get default() {
    if (!this._column) {
      this._column = new ColumnLayout();
    }
    return this._column;
  }

  constructor(properties = {}, queue) {
    super('padding' in properties ? properties : {padding: 16}, queue);
    this._firstLayoutData = LayoutData.from({
      left: this._padding.left,
      top: this._padding.top,
      right: this._padding.right
    });
    this._defaultLayoutData = LayoutData.from({
      left: this._padding.left,
      top: [LayoutData.prev, 16],
      right: this._padding.right
    });
  }

  _getLayoutData(child) {
    return child.layoutData;
  }

  _getRawLayoutData(layoutData, targetWidget, index) {
    const targetLayoutData = index === 0 ? this._firstLayoutData : this._defaultLayoutData;
    return super._resolveAttributes(targetLayoutData, targetWidget);
  }

}

import Layout from './Layout';
import LayoutData from './LayoutData';

export default class ColumnLayout extends Layout {

  static get default() {
    if (!this._column) {
      this._column = new ColumnLayout();
    }
    return this._column;
  }

  constructor(properties, queue) {
    super(properties, queue);
    this._defaultLayoutData = LayoutData.from({left: 16, top: [LayoutData.prev, 16], right: 16});
  }

  _getLayoutData() {
    return this._defaultLayoutData;
  }

}

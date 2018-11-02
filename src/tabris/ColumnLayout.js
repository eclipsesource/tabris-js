import {LayoutQueue} from './Layout';
import Layout from './Layout';
import LayoutData from './LayoutData';

export default class ColumnLayout extends Layout {

  static create() {
    if (!this._column) {
      this._column = new ColumnLayout(LayoutQueue.instance);
    }
    return this._column;
  }

  constructor(queue) {
    if (!(queue instanceof LayoutQueue)) {
      throw new Error(
        'ColumnLayout constructor is private. Use ColumnLayout.create().'
      );
    }
    super(queue);
    this._defaultLayoutData = LayoutData.from({left: 16, top: [LayoutData.prev, 16], right: 16});
  }

  _getLayoutData() {
    return this._defaultLayoutData;
  }

}

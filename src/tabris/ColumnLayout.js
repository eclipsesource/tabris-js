import {LayoutQueue} from './Layout';
import Layout from './Layout';
import LayoutData from './LayoutData';

export default class ColumnLayout extends Layout {

  constructor(queue) {
    if (!(queue instanceof LayoutQueue)) {
      throw new Error(
        'ColumnLayout constructor is private. Use Layout.column() to get ColumnLayout instances.'
      );
    }
    super(queue);
    this._defaultLayoutData = LayoutData.from({left: 16, top: [LayoutData.prev, 16], right: 16});
  }

  _getLayoutData() {
    return this._defaultLayoutData;
  }

}

// This method can not be defined in Layout.js without
// causing circular dependency issues
Layout.column = (function() {
  if (!this._column) {
    this._column = new ColumnLayout(LayoutQueue.instance);
  }
  return this._column;
}).bind(Layout);

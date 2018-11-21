import Composite from './Composite';
import ColumnLayout from '../ColumnLayout';
import NativeObject from '../NativeObject';

export default class Column extends Composite {

  constructor(properties) {
    super(properties);
  }

  _initLayout(props = {}) {
    let layout = props.layout || ColumnLayout.default;
    if ('padding' in props || 'spacing' in props) {
      layout = new ColumnLayout({
        padding: 'padding' in props ? props.padding : layout.padding,
        spacing: 'spacing' in props ? props.spacing : layout.spacing
      });
    }
    this._checkLayout(layout);
    this._layout = layout;
    this._layout.add(this);
  }

  _checkLayout(value) {
    if (!(value instanceof ColumnLayout)) {
      throw new Error('Not an instance of "ColumnLayout"');
    }
  }

}

NativeObject.defineProperties(Column.prototype, {
  spacing: {
    type: 'number',
    get() {
      return this._layout.spacing;
    }
  }
});

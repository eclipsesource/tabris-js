import Composite from './Composite';
import RowLayout from '../RowLayout';
import {toValueString} from '../Console';

export default class Row extends Composite {

  constructor(properties) {
    super(properties);
  }

  get spacing() {
    return this._layout.spacing;
  }

  // prevent error due to _nativeCreate attempting to set
  set spacing(value) {}

  get alignment() {
    return this._layout.alignment;
  }

  // prevent error due to _nativeCreate attempting to set
  set alignment(value) {}

  _initLayout(props = {}) {
    let layout = props.layout || RowLayout.default;
    if ('spacing' in props || 'alignment' in props) {
      layout = new RowLayout({
        spacing: 'spacing' in props ? props.spacing : layout.spacing,
        alignment: 'alignment' in props ? props.alignment : layout.alignment
      });
    }
    this._checkLayout(layout);
    Object.defineProperty(
      this, '_layout', {enumerable: false, writable: false, value: layout}
    );
    this._layout.add(this);
  }

  _checkLayout(value) {
    if (!(value instanceof RowLayout)) {
      throw new Error(`${toValueString(value)} is not an instance of RowLayout`);
    }
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    result.push(['alignment', this.alignment]);
    return result;
  }

}

import Composite from './Composite';
import StackLayout from '../StackLayout';
import {toValueString} from '../Console';

export default class Stack extends Composite {

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
    let layout = props.layout || StackLayout.default;
    if ('spacing' in props || 'alignment' in props) {
      layout = new StackLayout({
        spacing: 'spacing' in props ? props.spacing : layout.spacing,
        alignment: 'alignment' in props ? props.alignment : layout.alignment
      });
    }
    this._checkLayout(layout);
    this._layout = layout;
    this._layout.add(this);
  }

  _checkLayout(value) {
    if (!(value instanceof StackLayout)) {
      throw new Error(`${toValueString(value)} is not an instance of StackLayout`);
    }
  }

  _getXMLAttributes() {
    const result = super._getXMLAttributes();
    result.push(['alignment', this.alignment]);
    return result;
  }

}

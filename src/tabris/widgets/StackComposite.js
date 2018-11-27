import Composite from './Composite';
import StackLayout from '../StackLayout';
import NativeObject from '../NativeObject';

export default class StackComposite extends Composite {

  constructor(properties) {
    super(properties);
  }

  _initLayout(props = {}) {
    let layout = props.layout || StackLayout.default;
    if ('padding' in props || 'spacing' in props) {
      layout = new StackLayout({
        padding: 'padding' in props ? props.padding : layout.padding,
        spacing: 'spacing' in props ? props.spacing : layout.spacing
      });
    }
    this._checkLayout(layout);
    this._layout = layout;
    this._layout.add(this);
  }

  _checkLayout(value) {
    if (!(value instanceof StackLayout)) {
      throw new Error('Not an instance of "StackLayout"');
    }
  }

}

NativeObject.defineProperties(StackComposite.prototype, {
  spacing: {
    type: 'number',
    get() {
      return this._layout.spacing;
    }
  }
});

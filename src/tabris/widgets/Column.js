import Composite from './Composite';
import ColumnLayout from '../ColumnLayout';

export default class Column extends Composite {

  constructor(properties) {
    super(properties);
  }

  _initLayout() {
    this._layout = ColumnLayout.create();
    this._layout.add(this);
  }

  _checkLayout() {
    throw new Error('Property "layout" of type "Column" can not be changed');
  }

}

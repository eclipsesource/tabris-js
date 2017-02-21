import Widget from '../Widget';

export default class Composite extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Composite', properties);
  }

  _acceptChild() {
    return true;
  }

}

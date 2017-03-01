import Widget from '../Widget';

export default class Composite extends Widget {

  get _nativeType() {
    return 'tabris.Composite';
  }

  _acceptChild() {
    return true;
  }

}

import CanvasContext from '../CanvasContext';
import Widget from '../Widget';

export default class Canvas extends Widget {

  get _nativeType() {
    return 'tabris.Canvas';
  }

  getContext(type, width, height) {
    if (type === '2d') {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  }

  _acceptChild() {
    return true;
  }

}

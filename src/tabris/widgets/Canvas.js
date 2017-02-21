import CanvasContext from '../CanvasContext';
import Widget from '../Widget';

export default class Canvas extends Widget {

  constructor(properties) {
    super();
    this._create('tabris.Canvas', properties);
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

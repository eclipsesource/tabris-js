import CanvasContext from '../CanvasContext';
import Composite from './Composite';

export default class Canvas extends Composite {

  get _nativeType() {
    return 'tabris.Canvas';
  }

  getContext(type, width, height) {
    if (type === '2d') {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  }

}

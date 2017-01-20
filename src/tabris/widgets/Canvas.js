import CanvasContext from '../CanvasContext';
import Widget from '../Widget';

const CONFIG = {
  _name: 'Canvas',
  _type: 'tabris.Canvas',
  _supportsChildren: true,
};

export default class Canvas extends Widget.extend(CONFIG) {

  getContext(type, width, height) {
    if (type === '2d') {
      return CanvasContext.getContext(this, width, height);
    }
    return null;
  }

}

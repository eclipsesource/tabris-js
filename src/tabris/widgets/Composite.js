import Widget from '../Widget';

const CONFIG = {
  _name: 'Composite',
  _type: 'tabris.Composite'
};

export default class Composite extends Widget.extend(CONFIG) {

  _acceptChild() {
    return true;
  }

}

import Widget from '../Widget';

const CONFIG = {
  _name: 'Composite',
  _type: 'tabris.Composite',
  _supportsChildren: true
};

export default class Composite extends Widget.extend(CONFIG) {}

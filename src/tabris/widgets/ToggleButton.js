import Widget from '../Widget';

const CONFIG = {
  _name: 'ToggleButton',
  _type: 'tabris.ToggleButton',
  _events: {
    select: true
  },
  _properties: {
    text: {type: 'string', default: ''},
    image: {type: 'image', default: null},
    selection: {type: 'boolean', nocache: true},
    alignment: {type: ['choice', ['left', 'right', 'center']], default: 'center'}
  }
};

export default class ToggleButton extends Widget.extend(CONFIG) {

  _listen(name, listening) {
    if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection({selection}) {
    this._triggerChangeEvent('selection', selection);
  }

}

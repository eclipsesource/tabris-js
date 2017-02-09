import Widget from '../Widget';

const CONFIG = {
  _name: 'CheckBox',
  _type: 'tabris.CheckBox',
  _events: {
    select: {
      trigger(name, event) {
        this.trigger('select', this, event.selection, {});
      }
    }
  },
  _properties: {
    text: {type: 'string', default: ''},
    selection: {type: 'boolean', nocache: true}
  }
};

export default class CheckBox extends Widget.extend(CONFIG) {

  _listen(name, listening) {
    if (name === 'change:selection') {
      this._onoff('select', listening, this.$triggerChangeSelection);
    } else {
      super._listen(name, listening);
    }
  }

  $triggerChangeSelection(widget, selection) {
    this._triggerChangeEvent('selection', selection);
  }

}

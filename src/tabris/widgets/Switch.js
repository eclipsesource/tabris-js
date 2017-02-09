import Widget from '../Widget';

const CONFIG = {
  _name: 'Switch',
  _type: 'tabris.Switch',
  _events: {
    select: {
      trigger(name, event) {
        this.trigger('select', this, event.selection, {});
      }
    }
  },
  _properties: {
    selection: {type: 'boolean', nocache: true},
    thumbOnColor: {type: 'color'},
    thumbOffColor: {type: 'color'},
    trackOnColor: {type: 'color'},
    trackOffColor: {type: 'color'}
  }
};

export default class Switch extends Widget.extend(CONFIG) {

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

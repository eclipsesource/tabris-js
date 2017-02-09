import Widget from '../Widget';

const CONFIG = {
  _name: 'Slider',
  _type: 'tabris.Slider',
  _events: {
    select: {
      trigger(name, event) {
        this.trigger('select', this, event.selection, {});
      }
    }
  },
  _properties: {
    minimum: {type: 'integer', default: 0},
    maximum: {type: 'integer', default: 100},
    selection: {type: 'integer', nocache: true}
  }
};

export default class Slider extends Widget.extend(CONFIG) {

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

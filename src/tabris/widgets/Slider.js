import Widget from '../Widget';

const CONFIG = {
  _name: 'Slider',
  _type: 'tabris.Slider',
  _events: {
    select: {
      alias: 'change:selection',
      trigger(name, event) {
        this._triggerChangeEvent('selection', event.selection);
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

export default class Slider extends Widget.extend(CONFIG) {}

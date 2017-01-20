import Widget from '../Widget';

const CONFIG = {
  _name: 'RadioButton',
  _type: 'tabris.RadioButton',
  _events: {
    select: {
      alias: 'change:selection',
      trigger(event) {
        this._triggerChangeEvent('selection', event.selection);
        this.trigger('select', this, event.selection, {});
      }
    }
  },
  _properties: {
    text: {type: 'string', default: ''},
    selection: {type: 'boolean', nocache: true}
  }
};

export default class RadioButton extends Widget.extend(CONFIG) {}

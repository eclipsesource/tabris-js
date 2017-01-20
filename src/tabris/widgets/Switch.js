import Widget from '../Widget';

const CONFIG = {
  _name: 'Switch',
  _type: 'tabris.Switch',
  _events: {
    select: {
      alias: 'change:selection',
      trigger(event) {
        this.trigger('change:selection', this, event.selection, {});
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

export default class Switch extends Widget.extend(CONFIG) {}

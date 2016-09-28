import Widget from '../Widget';

export default Widget.extend({
  _name: 'RadioButton',
  _type: 'tabris.RadioButton',
  _events: {
    select: {
      alias: 'change:selection',
      trigger: function(event) {
        this._triggerChangeEvent('selection', event.selection);
        this.trigger('select', this, event.selection, {});
      }
    }
  },
  _properties: {
    text: {type: 'string', default: ''},
    selection: {type: 'boolean', nocache: true}
  }
});

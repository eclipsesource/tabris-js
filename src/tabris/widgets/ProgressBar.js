import Widget from '../Widget';

export default Widget.extend({
  _name: 'ProgressBar',
  _type: 'tabris.ProgressBar',
  _properties: {
    minimum: {type: 'integer', default: 0},
    maximum: {type: 'integer', default: 100},
    selection: {type: 'integer', default: 0},
    state: {type: ['choice', ['normal', 'paused', 'error']], default: 'normal'}
  }
});

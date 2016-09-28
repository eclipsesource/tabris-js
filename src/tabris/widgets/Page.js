import Widget from '../Widget';

export default Widget.extend({

  _name: 'Page',

  _type: 'tabris.Page',

  _supportsChildren: true,

  _properties: {
    image: {type: 'image', default: null},
    title: {type: 'string', default: ''},
    topLevel: {type: 'boolean', default: false}
  }

});

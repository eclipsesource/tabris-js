import NativeObject from './NativeObject';

const CONFIG = {
  _type: 'tabris.GestureRecognizer',
  _properties: {
    type: 'string',
    target: 'proxy',
    fingers: 'natural',
    touches: 'natural',
    duration: 'natural',
    direction: 'string'
  },

  _events: {
    gesture: true
  }
};

export default class GestureRecognizer extends NativeObject.extend(CONFIG) {}

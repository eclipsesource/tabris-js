import NativeObject from '../NativeObject';
import Widget from '../Widget';
import {types} from '../property-types';
import Blob from '../Blob';
import {getBytes} from '../util';

export default class PdfView extends Widget {

  get _nativeType() {
    return 'tabris.PdfView';
  }

  _getXMLAttributes() {
    return super._getXMLAttributes().concat([
      ['src', (this.src || '')]
    ]);
  }

  set padding(value) {
    if (tabris.device.platform !== 'iOS') {
      super.padding = value;
    }
  }

}

NativeObject.defineProperties(PdfView.prototype, {
  src: {
    type: {
      convert(value) {
        if (value != null && typeof value !== 'string' && !(value instanceof Blob)) {
          throw new Error('Value must be of type string or Blob');
        }
        return value || null;
      },
      encode(value) {
        if (typeof value === 'string') {
          return {type: 'uri', uri: value};
        } else if (value instanceof Blob) {
          return {type: 'buffer', buffer: getBytes(value)};
        }
        return null;
      }
    },
    default: null
  },
  zoomEnabled: {type: types.boolean, default: false},
  spacing: {type: 'dimension', default: 0},
  pageElevation: {type: 'natural', default: 0},
  pageBackground: {type: 'ColorValue', default: 'initial'}
});

NativeObject.defineEvents(PdfView.prototype, {
  load: {native: true}
});

import NativeObject from './NativeObject';
import Font from './Font';
import {types} from './property-types';

export default class SizeMeasurement extends NativeObject {

  /** @override */
  _nativeCreate(param) {
    if (param !== true) {
      throw new Error('SizeMeasurement can not be created');
    }
    super._nativeCreate();
  }

  get _nativeType() {
    return 'tabris.SizeMeasurement';
  }

  measureTexts(configs) {
    return new Promise((resolve, reject) => {
      if (arguments.length < 1) {
        throw new Error('Not enough arguments to measure texts');
      }
      if (!Array.isArray(configs)) {
        throw new Error('The text measurement configs have to be an array');
      }
      this._nativeCall('measureTexts', {
        configs: configs.map((config) => ({
          text: checkText(config.text),
          font: checkFont(config.font),
          markupEnabled: !!config.markupEnabled,
          maxWidth: 'maxWidth' in config ? types.dimension.convert(config.maxWidth) : undefined,
        })),
        onResult: (result) => resolve(result),
        onError: (error) => reject(new Error(error)),
      });
    });
  }

  dispose() {
    throw new Error('Cannot dispose sizeMeasurement object');
  }

}

function checkText(text) {
  if (!text) {
    throw new Error('A text measurement configuration has to provide a "text" value');
  }
  return text;
}

function checkFont(fontValue) {
  const font = Font.from(fontValue);
  if (!font.size) {
    throw new Error('A text measurement configuration has to provide a font size via the "font" property');
  }
  return font;
}

export function create() {
  return new SizeMeasurement(true);
}

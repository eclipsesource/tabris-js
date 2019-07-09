import TextEncoder from './TextEncoder';
import TextDecoder from './TextDecoder';
import {getBytes, setBytes} from './util';

export default class Blob {

  /**
   * @param {Array=} blobParts
   * @param {Object=} options
   */
  constructor(blobParts = [], options = {}) {
    if (Object.getPrototypeOf(blobParts) !== Array.prototype) {
      throw new TypeError('Argument 1 of Blob.constructor can\'t be converted to a sequence.');
    }
    if (Object.getPrototypeOf(options) !== Object.prototype) {
      throw new TypeError('Argument 2 of Blob.constructor can\'t be converted to a dictionary.');
    }
    setBytes(this, join(blobParts));
    Object.defineProperty(this, 'type', {value: 'type' in options ? options.type + '' : ''});
  }

  get size() {
    return getBytes(this).byteLength;
  }

  arrayBuffer() {
    return Promise.resolve(getBytes(this).slice(0));
  }

  text() {
    return TextDecoder.decode(getBytes(this));
  }

}

Object.defineProperty(Blob.prototype, 'type', {value: ''});

/** @param {Array} parts*/
function join(parts) {
  let size = 0;
  /** @type {Uint8Array[]} */
  const chunks = [];
  for (let i = 0; i < parts.length; i++) {
    chunks[i] = partToChunk(parts[i]);
    size += chunks[i].byteLength;
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (let i = 0; i < chunks.length; i++) {
    result.set(chunks[i], offset);
    offset += chunks[i].byteLength;
  }
  return result.buffer;
}

/**
 * @param {any} part
 * @return {Uint8Array}
*/
function partToChunk(part) {
  if (part instanceof ArrayBuffer) {
    return new Uint8Array(part);
  }
  if (ArrayBuffer.isView(part)) {
    return new Uint8Array(part.buffer);
  }
  if (part instanceof Blob) {
    return new Uint8Array(getBytes(part));
  }
  return new Uint8Array(TextEncoder.encodeSync(part + ''));
}

Blob.prototype[Symbol.toStringTag] = 'Blob';

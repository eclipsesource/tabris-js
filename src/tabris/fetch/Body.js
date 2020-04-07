/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
import TextDecoder from '../TextDecoder';
import {isReadable, read, setBytes} from '../util';
import Blob from '../Blob';
import TextEncoder from '../TextEncoder';

export default class Body {

  constructor() {
    Object.defineProperties(this, {
      $bodyUsed: {enumerable: false, writable: true, value: false}
    });
  }

  _initBody(body) {
    Object.defineProperty(this, '_bodyInit', {
      enumerable: false, writable: false, value: body
    });
    if (!body) {
      Object.defineProperty(this, '_bodyText', {
        enumerable: false, writable: false, value: ''
      });
    } else if (typeof body === 'string') {
      Object.defineProperty(this, '_bodyText', {
        enumerable: false, writable: false, value: body
      });
    } else if (isReadable(body)) {
      Object.defineProperty(this, '_bodyBuffer', {
        enumerable: false, writable: false, value: read(body)
      });
    } else {
      throw new Error('unsupported BodyInit type');
    }
  }

  text() {
    return this.$consumed() || Promise.resolve(this._bodyBuffer ?
      TextDecoder.decode(this._bodyBuffer, this._encoding) :
      this._bodyText);
  }

  json() {
    return this.text().then(JSON.parse);
  }

  blob() {
    return this.arrayBuffer().then(buffer => {
      const blob = new Blob([], {
        type: this.headers ? this.headers.get('content-type') : ''
      });
      setBytes(blob, buffer);
      return blob;
    });
  }

  arrayBuffer() {
    return this.$consumed() || Promise.resolve(this._bodyBuffer ?
      this._bodyBuffer :
      TextEncoder.encode(this._bodyText, this._encoding));
  }

  get bodyUsed() {
    return !!this.$bodyUsed;
  }

  $consumed() {
    if (this.$bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    this.$bodyUsed = true;
  }

  get _encoding() {
    return undefined;
  }

}

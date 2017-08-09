/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
import TextDecoder from '../TextDecoder';

export default class Body {

  _initBody(body) {
    this._bodyInit = body;
    if (!body) {
      this._bodyText = '';
    } else if (typeof body === 'string') {
      this._bodyText = body;
    } else if ((ArrayBuffer.prototype.isPrototypeOf(body) || ArrayBuffer.isView(body))) {
      this._bodyBuffer = body.slice(0);
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

  arrayBuffer() {
    return this.$consumed() || Promise.resolve(this._bodyBuffer);
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

  get _encoding() {}

}

/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
import Headers from './Headers';
import Body from './Body';

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

export default class Response extends Body {

  constructor(bodyInit, options = {}) {
    super();
    Object.defineProperties(this, {
      url: {value: options.url || ''},
      type: {value: options._type || 'default'},
      status: {value: 'status' in options ? options.status : 200},
      statusText: {value: 'statusText' in options ? options.statusText : 'OK'},
      headers: {value: new Headers(options.headers)}
    });
    this._initBody(bodyInit);
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  clone() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  }

  get _encoding() {
    const contentType = this.headers.get('content-type') || '';
    const parameters = contentType.split(';').slice(1);
    for (const param of parameters) {
      const match = /charset=(\S+)/i.exec(param.trim());
      if (match) {
        return match[1].toLowerCase();
      }
    }
    return null;
  }

  static error() {
    return new Response(null, {status: 0, statusText: '', _type: 'error'});
  }

  static redirect(url, status) {
    if (!REDIRECT_STATUSES.includes(status)) {
      throw new RangeError('Invalid status code');
    }
    return new Response(null, {status, headers: {location: url}});
  }

}

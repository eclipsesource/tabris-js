/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
import Headers from './Headers';
import Body from './Body';
import Blob from '../Blob';
import FormData, {formDataToBlob} from '../FormData';

// HTTP methods whose capitalization should be normalized
const METHODS = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

export default class Request extends Body {

  constructor(input, options = {}) {
    super();
    let body = options.body;
    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.$bodyUsed = true;
      }
    } else {
      input = {
        url: input
      };
    }
    Object.defineProperties(this, {
      url: {value: '' + input.url},
      method: {value: normalizeMethod(options.method || input.method || 'GET')},
      headers: {value: new Headers(options.headers || input.headers || {})},
      credentials: {value: options.credentials || input.credentials || 'omit'},
      mode: {value: options.mode || input.mode || null},
      referrer: {value: ''},
      timeout: {value: options.timeout || 0}
    });
    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    if (body instanceof FormData) {
      body = formDataToBlob(body);
    }
    if (body instanceof Blob && !this.headers.has('Content-Type')) {
      this.headers.set('Content-Type', body.type);
    }
    this._initBody(body);
  }

  clone() {
    return new Request(this, {
      body: this._bodyInit
    });
  }

}

function normalizeMethod(method) {
  const upcased = method.toUpperCase();
  return METHODS.includes(upcased) ? upcased : method;
}

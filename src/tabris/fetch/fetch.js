/**
 * Original work Copyright (c) 2014-2016 GitHub, Inc.
 * Implementation based on https://github.com/github/fetch
 */
import Headers from './Headers';
import Request from './Request';
import Response from './Response';
import HttpRequest from '../HttpRequest';

export function fetch(input, init) {
  return new Promise((resolve, reject) => {
    const request = new Request(input, init);
    const hr = new HttpRequest();
    const options = {};
    hr.on('stateChanged', (event) => {
      switch (event.state) {
        case 'headers':
          options.status = event.code;
          options.statusText = event.message;
          options.headers = new Headers(event.headers);
          break;
        case 'finished':
          options.url = options.headers.get('X-Request-URL') || request.url;
          resolve(new Response(event.response, options));
          hr.dispose();
          break;
        case 'error':
          reject(new TypeError('Network request failed'));
          hr.dispose();
          break;
        case 'timeout':
          reject(new TypeError('Network request timed out'));
          hr.dispose();
          break;
        case 'abort':
          reject(new TypeError('Network request aborted'));
          hr.dispose();
          break;
      }
    });
    hr.send({
      url: request.url,
      method: request.method,
      responseType: 'arraybuffer',
      data: (typeof request._bodyInit === 'undefined') ? null : request._bodyBuffer || request._bodyInit,
      headers: encodeHeaders(request.headers),
      timeout: request.timeout
    });
  });
}

function encodeHeaders(headers) {
  const map = {};
  headers.forEach((value, name) => map[name] = value);
  return map;
}

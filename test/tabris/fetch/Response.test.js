import {expect} from '../../test';
import Response from '../../../src/tabris/fetch/Response';
import Headers from '../../../src/tabris/fetch/Headers';

describe('Response', function() {

  describe('constructor', function() {

    it('succeeds without arguments', function() {
      const response = new Response();
      expect(response.bodyUsed).to.be.false;
    });

    it('accepts body', function() {
      const response = new Response('{"foo": 23}');
      return response.text().then(body => expect(body).to.equal('{"foo": 23}'));
    });

    it('accepts options', function() {
      const response = new Response('', {
        url: 'http://example.org/',
        status: 404,
        statusText: 'Not found',
        headers: {foo: '23'}
      });
      expect(response.url).to.equal('http://example.org/');
      expect(response.status).to.equal(404);
      expect(response.statusText).to.equal('Not found');
      expect(response.headers.get('foo')).to.equal('23');
    });

  });

  describe('instance', function() {

    let response;

    beforeEach(function() {
      response = new Response();
    });

    describe('url', function() {

      it('defaults to empty string', function() {
        expect(response.url).to.equal('');
      });

      it('is read-only', function() {
        response.url = 'foo';
        expect(response.url).to.equal('');
      });

    });

    describe('type', function() {

      it('defaults to `default`', function() {
        expect(response.type).to.equal('default');
      });

      it('is read-only', function() {
        response.type = 'error';
        expect(response.type).to.equal('default');
      });

    });

    describe('status', function() {

      it('defaults to 200', function() {
        expect(response.status).to.equal(200);
      });

      it('is read-only', function() {
        response.status = 300;
        expect(response.status).to.equal(200);
      });

    });

    describe('statusText', function() {

      it('defaults to 200', function() {
        expect(response.statusText).to.equal('OK');
      });

      it('is read-only', function() {
        response.statusText = 'foo';
        expect(response.statusText).to.equal('OK');
      });

    });

    describe('ok', function() {

      it('defaults to true', function() {
        expect(response.ok).to.be.true;
      });

      it('is read-only', function() {
        response.ok = false;
        expect(response.ok).to.be.true;
      });

    });

    describe('headers', function() {

      it('defaults to empty headers', function() {
        expect(response.headers).to.be.instanceOf(Headers);
        expect(Array.from(response.headers.entries)).to.deep.equal([]);
      });

      it('is read-only', function() {
        const orig = response.headers;
        response.headers = new Headers();
        expect(response.headers).to.equal(orig);
      });

    });

    describe('clone', function() {

      it('creates new instance', function() {
        response = new Response();
        const clone = response.clone();
        expect(clone).to.be.instanceOf(Response);
        expect(clone).not.to.be.equal(response);
      });

      it('copies response body', function() {
        response = new Response('content');
        const clone = response.clone();
        return clone.text().then(body => expect(body).to.equal('content'));
      });

      it('copies response properties', function() {
        response = new Response('', {
          url: 'http://example.org/',
          status: 404,
          statusText: 'Not found',
          headers: {foo: 23}
        });
        const clone = response.clone();
        expect(clone.url).to.equal(response.url);
        expect(clone.status).to.equal(response.status);
        expect(clone.statusText).to.equal(response.statusText);
        expect(Array.from(clone.headers.entries())).to.deep.equal(Array.from(response.headers.entries()));
        expect(clone._bodyInit).to.equal(response._bodyInit);
      });

    });

    describe('_encoding', function() {
      // See https://tools.ietf.org/html/rfc7231#section-3.1.1.1

      it('is null if no Content-Type header', function() {
        response = new Response();
        expect(response._encoding).to.be.null;
      });

      it('is null if not included in Content-Type header', function() {
        response = new Response('', {headers: {'Content-Type': 'text/plain'}});
        expect(response._encoding).to.be.null;
      });

      it('is extracted from Content-Type header', function() {
        response = new Response('', {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
        expect(response._encoding).to.equal('utf-8');
      });

      it('handles mixed case in header name and charset parameter', function() {
        response = new Response('', {headers: {'content-TYPE': 'text/plain; CHARset=utf-8'}});
        expect(response._encoding).to.equal('utf-8');
      });

      it('handles additional parameters and whitespace', function() {
        response = new Response('', {headers: {'Content-Type': 'text/plain; foo=23 ; charset=utf-8 ; bar=42'}});
        expect(response._encoding).to.equal('utf-8');
      });

      it('returns lower case', function() {
        response = new Response('', {headers: {'Content-Type': 'text/plain; charset=UTF-8'}});
        expect(response._encoding).to.equal('utf-8');
      });

    });

    describe('error', function() {

      it('returns a response object with type `error`', function() {
        response = Response.error();
        expect(response.type).to.equal('error');
        expect(response.url).to.equal('');
        expect(response.status).to.equal(0);
        expect(response.statusText).to.equal('');
      });

    });

    describe('redirect', function() {

      it('returns a response object with url and status', function() {
        response = Response.redirect('http://example.com/', 301);
        expect(response.url).to.equal('');
        expect(response.status).to.equal(301);
        expect(response.statusText).to.equal('OK');
        expect(response.headers.get('Location')).to.equal('http://example.com/');
      });

      it('rejects non-redirect status codes', function() {
        expect(() => Response.redirect('http://example.com/', 200)).to.throw(Error, 'Invalid status code');
      });

    });

  });

});

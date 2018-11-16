import {expect} from '../../test';
import Request from '../../../src/tabris/fetch/Request';
import Headers from '../../../src/tabris/fetch/Headers';

describe('Request', function() {

  describe('constructor', function() {

    it('succeeds without arguments', function() {
      const request = new Request();
      expect(request.bodyUsed).to.be.false;
    });

    it('accepts string', function() {
      const request = new Request('http://example.com');
      expect(request.url).to.equal('http://example.com');
    });

    it('accepts unused Request object', function() {
      const request = new Request(new Request('http://example.com'));
      expect(request.url).to.equal('http://example.com');
    });

    it('rejects used Request object', function() {
      const request = new Request('http://example.com');
      request.text();
      expect(() => new Request(request)).to.throw(Error, 'Already read');
    });

    it('accepts init object', function() {
      const request = new Request('http://example.com', {
        method: 'post',
        headers: {foo: 23},
        body: '{"result": true}'
      });
      expect(request.method).to.equal('POST');
      expect(Array.from(request.headers.entries())).to.deep.equal([['foo', '23']]);
      expect(request._bodyInit).to.equal('{"result": true}');
    });

    it('rejects body if method is GET', function() {
      expect(() => new Request('http://example.com', {
        method: 'GET',
        body: '{"result": true}'
      })).to.throw(Error, 'Body not allowed');
    });

  });

  describe('instance', function() {

    let request;

    beforeEach(function() {
      request = new Request('http://example.com');
    });

    describe('url', function() {

      it('is read-only', function() {
        request.url = 'foo';
        expect(request.url).to.equal('http://example.com');
      });

    });

    describe('method', function() {

      it('defaults to `GET`', function() {
        expect(request.method).to.equal('GET');
      });

      it('is read-only', function() {
        request.method = 'post';
        expect(request.method).to.equal('GET');
      });

    });

    describe('headers', function() {

      it('defaults to empty headers', function() {
        expect(request.headers).to.be.instanceOf(Headers);
        expect(Array.from(request.headers.entries)).to.deep.equal([]);
      });

      it('is read-only', function() {
        const orig = request.headers;
        request.headers = new Headers();
        expect(request.headers).to.equal(orig);
      });

    });

    describe('credentials', function() {

      it('defaults to `omit`', function() {
        expect(request.credentials).to.equal('omit');
      });

      it('is read-only', function() {
        request.credentials = 'include';
        expect(request.credentials).to.equal('omit');
      });

    });

    describe('referrer', function() {

      it('defaults to empty string', function() {
        expect(request.referrer).to.equal('');
      });

      it('is read-only', function() {
        request.referrer = 'http://example.com/';
        expect(request.referrer).to.equal('');
      });

    });

    describe('timeout', function() {

      it('defaults to 0', function() {
        expect(request.timeout).to.equal(0);
      });

      it('is accepted in config', function() {
        request = new Request('http://example.com', {timeout: 23});
        expect(request.timeout).to.equal(23);
      });

      it('is read-only', function() {
        request.timeout = 23;
        expect(request.timeout).to.equal(0);
      });

    });

    describe('mode', function() {

      it('is read-only', function() {
        request.mode = 'websocket';
        expect(request.mode).to.be.null;
      });

    });

  });

  describe('clone', function() {

    it('works with GET request', function() {
      const request = new Request('http://example.com', {
        headers: {foo: 23}
      });
      const clone = request.clone();
      expect(clone.url).to.equal(request.url);
      expect(clone.method).to.equal(request.method);
      expect(Array.from(clone.headers.entries())).to.deep.equal(Array.from(request.headers.entries()));
      expect(clone._bodyInit).to.equal(request._bodyInit);
    });

    it('works with POST request', function() {
      const request = new Request('http://example.com', {
        method: 'post',
        headers: {foo: 23},
        body: '{"result": true}'
      });
      const clone = request.clone();
      expect(clone.url).to.equal(request.url);
      expect(clone.method).to.equal(request.method);
      expect(Array.from(clone.headers.entries())).to.deep.equal(Array.from(request.headers.entries()));
      expect(clone._bodyInit).to.equal(request._bodyInit);
    });

  });

});

import {expect, spy, stub, match, restore} from '../test';
import ClientStub from './ClientStub';
import XMLHttpRequest from '../../src/tabris/XMLHttpRequest';
import NativeBridge from '../../src/tabris/NativeBridge';
import ProxyStore from '../../src/tabris/ProxyStore';

describe('XMLHttpRequest', function() {

  let proxy, client, xhr;

  function sendRequest(xhr) {
    xhr.open('GET', 'http://foo.com');
    xhr.send();
  }

  beforeEach(function() {
    global.tabris = {
      on: () => {},
      _proxies: new ProxyStore()
    };
    client = new ClientStub();
    global.tabris._nativeBridge = new NativeBridge(client);
    let origCreate = tabris._nativeBridge.create;
    stub(tabris._nativeBridge, 'create', (cid, type) => {
      if (type === 'tabris.HttpRequest') {
        proxy = tabris._proxies.find(cid);
        spy(proxy, '_nativeCall');
      }
      return origCreate.apply(tabris._nativeBridge, arguments);
    });
    xhr = new XMLHttpRequest();
  });

  afterEach(function() {
    xhr = null;
    restore();
  });

  it('is an EventTarget', function() {
    let handler1 = spy();
    let handler2 = spy();
    xhr.addEventListener('foo', handler1);
    xhr.addEventListener('bar', handler2);
    xhr.removeEventListener('foo', handler1);
    xhr.dispatchEvent({type: 'foo'});
    xhr.dispatchEvent({type: 'bar'});
    expect(handler2).to.have.been.called;
    expect(handler1).to.have.not.been.called;
  });

  describe('open', function() {

    it('fails without method', function() {
      expect(() => {
        xhr.open(undefined, 'http://foo.com');
      }).to.throw(Error, "Method argument should be specified to execute 'open'");
    });

    it('fails without url', function() {
      expect(() => {
        xhr.open('foo', undefined);
      }).to.throw(Error, "URL argument should be specified to execute 'open'");
    });

    it('fails for synchronous requests', function() {
      expect(() => {
        xhr.open('GET', 'http://foo.com', false);
      }).to.throw(Error, 'Only asynchronous request supported.');
    });

    it('sets async to true when argument omitted', function() {
      expect(() => {
        xhr.open('GET', 'http://foo.com');
      }).to.not.throw();
    });

    it('fails with method name containing space', function() {
      expect(() => {
        xhr.open('ba r', 'http://foo.com');
      }).to.throw(Error, "Invalid HTTP method, failed to execute 'open'");
    });

    it("doesn't fail with method name containing '!'", function() {
      expect(() => {
        xhr.open('ba!r', 'http://foo.com');
      }).to.not.throw();
    });

    it('fails with method name containing (del)', function() {
      expect(() => {
        xhr.open('ba' + String.fromCharCode(127) + 'r', 'http://foo.com');
      }).to.throw(Error, "Invalid HTTP method, failed to execute 'open'");
    });

    it("doesn't fail with method name containing '~'", function() {
      expect(() => {
        xhr.open('ba~r', 'http://foo.com');
      }).to.not.throw();
    });

    it('fails with forbidden method name', function() {
      expect(() => {
        xhr.open('CONNECT', 'http://foo.com');
      }).to.throw(Error, 'SecurityError: ' +
                      "'CONNECT' HTTP method is not secure, failed to execute 'open'");
    });

    it('fails with forbidden non-uppercase method name', function() {
      expect(() => {
        xhr.open('coNnEcT', 'http://foo.com');
      }).to.throw(Error, 'SecurityError: ' +
                      "'CONNECT' HTTP method is not secure, failed to execute 'open'");
    });

    it('fails with unsupported URL scheme', function() {
      expect(() => {
        xhr.open('GET', 'foo:bar');
      }).to.throw(Error, "Unsupported URL scheme, failed to execute 'open'");
    });

    it("sets object state to 'OPENED'", function() {
      xhr.open('GET', 'http://foo.com');
      expect(xhr.readyState).to.equal(1);
    });

    it('triggers a StateChange event', function() {
      xhr.onreadystatechange = spy();
      xhr.open('GET', 'http://foo.com');
      expect(xhr.onreadystatechange).to.have.been.called;
    });

    it('resets requestHeaders', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.setRequestHeader('Foo', 'Bar');
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({headers: {}}));
    });

    it('resets responseText', function() {
      sendRequest(xhr);
      proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
      xhr.open('GET', 'http://foo.com');
      expect(xhr.responseText).to.equal('');
    });

    it('sets sendInvoked to false', function() {
      sendRequest(xhr);
      proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      xhr.open('GET', 'http://foo.com');
      xhr.abort();
      expect(xhr.readyState).to.equal(xhr.UNSENT);
    });

    it('sets url username and password if url relative', function() {
      xhr.withCredentials = true;
      xhr.open('GET', 'index.json', true, 'user', 'password');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        headers: {Authorization: 'Basic user:password'}
      }));
    });

    it("doesn't set url username and password if url relative and username or password null",
    function() {
      xhr.withCredentials = true;
      xhr.open('GET', 'index.json', true, 'user', null);
      xhr.send();
      expect(proxy._nativeCall).not.to.have.been.calledWith('send', match({
        headers: {Authorization: 'Basic user:password'}
      }));
    });

  });

  describe('send', function() {

    it('creates proxy', function() {
      xhr.open('GET', 'http://www.foo.com');
      xhr.send();

      expect(proxy).not.to.be.undefined;
    });

    it("fails when state not 'opened'", function() {
      expect(() => {
        xhr.send();
      }).to.throw(Error, 'InvalidStateError: ' +
                      "Object's state must be 'OPENED', failed to execute 'send'");
    });

    it('fails if send invoked', function() {
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(() => {
        xhr.send();
      }).to.throw(Error, "InvalidStateError: 'send' invoked, failed to execute 'send'");
    });

    it('calls proxy send with request URL specified as open argument', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        url: 'http://foo.com'
      }));
    });

    it('calls proxy send with method specified as open argument', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        method: 'GET'
      }));
    });

    it('calls proxy send with timeout property', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.timeout = 2000;
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        timeout: 2000
      }));
    });

    it('calls proxy send with headers property', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.setRequestHeader('Foo', 'Bar');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        headers: {Foo: 'Bar'}
      }));
    });

    it('calls proxy send with data property', function() {
      sendRequest(xhr);
      xhr.open('POST', 'http://foo.com');
      xhr.send('foo');
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        data: 'foo'
      }));
    });

    it('calls proxy send with null data if request method is HEAD or GET', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.send('foo');
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        data: null
      }));
      xhr.open('HEAD', 'http://foo.com');
      xhr.send('foo');
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        data: null
      }));
    });

    it('calls proxy send with headers property and appended header', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foo.com');
      xhr.setRequestHeader('Foo', 'Bar');
      xhr.setRequestHeader('Foo', 'Baz');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        headers: {Foo: 'Bar, Baz'}
      }));
    });

    it('resets error', function() {
      sendRequest(xhr);
      xhr.open('GET', 'http://foobar.com');
      xhr.send();
      proxy.trigger('StateChange', {state: 'error'});
      expect(xhr.responseText).to.equal('');
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
      expect(xhr.responseText).to.equal('foo');
    });

    it('resets uploadCompleted', function() {
      xhr.upload.onprogress = spy();
      xhr.open('POST', 'http://foo.com');
      xhr.send('foo');
      proxy.trigger('StateChange', {state: 'headers'});
      proxy.trigger('StateChange', {state: 'error'});
      expect(xhr.upload.onprogress).to.have.not.been.called;
      xhr.open('POST', 'http://foo.com');
      xhr.send('foo');
      proxy.trigger('StateChange', {state: 'error'});
      expect(xhr.upload.onprogress).to.have.been.called;
    });

    it('sets uploadCompleted when requestBody empty', function() {
      xhr.upload.onloadstart = spy();
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(xhr.upload.onloadstart).to.have.not.been.called;
    });

    it('calls onloadstart', function() {
      xhr.onloadstart = spy();
      xhr.open('GET', 'http://foobar.com');
      xhr.send();
      expect(xhr.onloadstart).to.have.been.called;
    });

    it('calls upload onloadstart', function() {
      xhr.upload.onloadstart = spy();
      xhr.open('POST', 'http://foobar.com');
      xhr.send('foo');
      expect(xhr.upload.onloadstart).to.have.been.called;
    });

    it('sends basic access authentication header when withCredentials true', function() {
      xhr.withCredentials = true;
      xhr.open('GET', 'http://user:password@foobar.com');
      xhr.send();
      expect(proxy._nativeCall).to.have.been.calledWith('send', match({
        headers: {Authorization: 'Basic user:password'}
      }));
    });

    it("doesn't send basic access authentication header when withCredentials false", function() {
      xhr.open('GET', 'http://user:password@foobar.com');
      xhr.send();
      expect(proxy._nativeCall).not.to.have.been.calledWith('send', match({
        headers: {Authorization: 'Basic user:password'}
      }));
    });

    it("doesn't send basic access authentication header when userdata null", function() {
      xhr.withCredentials = true;
      xhr.open('GET', 'http://foobar.com');
      xhr.send();
      expect(proxy._nativeCall).not.to.have.been.calledWith('send', match({
        headers: {Authorization: 'Basic user:password'}
      }));
    });

    describe('proxy StateChange callback', function() {

      let requestErrors = ['timeout', 'abort', 'error'];
      let progressEvents =  ['load', 'loadend'];

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("doesn't fail when onreadystatechange not implemented", function() {
        expect(() => {
          proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        }).to.not.throw();
      });

      it("sets readystatechange event type to 'readystatechange'", function() {
        xhr.onreadystatechange = spy();
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.onreadystatechange).to.have.been.calledWith(match({
          type: 'readystatechange'
        }));
      });

      it("calls onreadystatechange on proxy event state 'headers'", function() {
        xhr.onreadystatechange = spy();
        proxy.trigger('StateChange', {state: 'headers'});
        expect(xhr.onreadystatechange).to.have.been.called;
      });

      it("calls onreadystatechange on proxy event state 'loading'", function() {
        xhr.onreadystatechange = spy();
        proxy.trigger('StateChange', {state: 'loading'});
        expect(xhr.onreadystatechange).to.have.been.called;
      });

      it("calls onreadystatechange on proxy event state 'finished'", function() {
        xhr.onreadystatechange = spy();
        proxy.trigger('StateChange', {state: 'finished'});
        expect(xhr.onreadystatechange).to.have.been.called;
      });

      it("calls upload progress events on proxy event state 'headers'", function() {
        progressEvents.forEach((event) => {
          let handler = 'on' + event;
          xhr.upload[handler] = spy();
          proxy.trigger('StateChange', {state: 'headers'});
          expect(xhr.upload[handler]).to.have.been.called;
        });
      });

      it("calls progress events on proxy event state 'finished'", function() {
        progressEvents.forEach((event) => {
          let handler = 'on' + event;
          xhr[handler] = spy();
          proxy.trigger('StateChange', {state: 'finished'});
          expect(xhr[handler]).to.have.been.called;
          sendRequest(xhr);
        });
      });

      it("calls upload progress events on proxy event state 'finished'", function() {
        progressEvents.forEach((event) => {
          let handler = 'on' + event;
          xhr.upload[handler] = spy();
          proxy.trigger('StateChange', {state: 'finished'});
          expect(xhr.upload[handler]).to.have.been.called;
          sendRequest(xhr);
        });
      });

      it('sets target and currentTarget to XHR', function() {
        xhr.onreadystatechange = spy();
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.onreadystatechange).to.have.been.calledWith(match({
          target: xhr,
          currentTarget: xhr
        }));
      });

      it("sets state to 'HEADERS_RECEIVED' when proxy event state 'headers'", function() {
        proxy.trigger('StateChange', {state: 'headers'});
        expect(xhr.readyState).to.equal(xhr.HEADERS_RECEIVED);
      });

      it("sets HTTP status code to 'code' when state 'headers'", function() {
        proxy.trigger('StateChange', {state: 'headers', code: 200});
        expect(xhr.status).to.equal(200);
      });

      it("sets HTTP statusText to 'message' when state 'headers'", function() {
        proxy.trigger('StateChange', {state: 'headers', message: 'OK'});
        expect(xhr.statusText).to.equal('OK');
      });

      it("sets response headers to headers when proxy event state 'headers'", function() {
        proxy.trigger('StateChange', {
          state: 'headers',
          code: 200,
          headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
        });
        expect(xhr.getAllResponseHeaders()).to.equal('Header-Name1: foo\nHeader-Name2: bar, baz');
      });

      it("sets state to 'LOADING' when proxy event state 'loading'", function() {
        proxy.trigger('StateChange', {state: 'loading'});
        expect(xhr.readyState).to.equal(xhr.LOADING);
      });

      it("sets state to 'DONE' when proxy event state 'finished'", function() {
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.readyState).to.equal(xhr.DONE);
      });

      it("sets responseText to 'response' when proxy event state 'finished'", function() {
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.responseText).to.equal('foo');
      });

      it("sets state to 'DONE' on request error", function() {
        requestErrors.forEach((entry) => {
          proxy.trigger('StateChange', {state: entry});
          expect(xhr.readyState).to.equal(xhr.DONE);
          sendRequest(xhr);
        });
      });

      it('calls onreadystatechange on request error', function() {
        requestErrors.forEach((entry) => {
          xhr.onreadystatechange = spy();
          proxy.trigger('StateChange', {state: entry});
          expect(xhr.onreadystatechange).to.have.been.called;
          sendRequest(xhr);
        });
      });

      it('calls progress event handlers on request error', function() {
        requestErrors.forEach((entry) => {
          let handler = 'on' + entry;
          xhr.onprogress = spy();
          xhr[handler] = spy();
          xhr.onloadend = spy();
          proxy.trigger('StateChange', {state: entry});
          expect(xhr.onprogress).to.have.been.called;
          expect(xhr[handler]).to.have.been.called;
          expect(xhr.onloadend).to.have.been.called;
          sendRequest(xhr);
        });
      });

      it('calls upload progress event handlers on request error', function() {
        requestErrors.forEach((entry) => {
          let handler = 'on' + entry;
          xhr.upload.onprogress = spy();
          xhr.upload[handler] = spy();
          xhr.upload.onloadend = spy();
          xhr.open('POST', 'http://foo.com');
          xhr.send('foo');
          proxy.trigger('StateChange', {state: entry});
          expect(xhr.upload.onprogress).to.have.been.called;
          expect(xhr.upload[handler]).to.have.been.called;
          expect(xhr.upload.onloadend).to.have.been.called;
        });
      });

      it("doesn't call upload event handler on request error when upload complete", function() {
        requestErrors.forEach((entry) => {
          let handler = 'on' + entry;
          xhr.upload.onprogress = spy();
          xhr.upload[handler] = spy();
          xhr.upload.onloadend = spy();
          xhr.open('GET', 'http://foo.com');
          xhr.send();
          proxy.trigger('StateChange', {state: 'headers'});
          proxy.trigger('StateChange', {state: entry});
          expect(xhr.upload.onprogress).to.have.not.been.called;
          expect(xhr.upload[handler]).to.have.not.been.called;
          expect(xhr.upload.onloadend).to.have.been.calledOnce; // called on "headers" stateChange
        });
      });

      it('sets error to true on request error', function() {
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'error'});
        expect(xhr.responseText).to.equal('');
      });

      it("calls onprogress on proxy event 'DownloadProgress'", function() {
        xhr.onprogress = spy();
        proxy.trigger('DownloadProgress', {lengthComputable: true, loaded: 50, total: 100});
        expect(xhr.onprogress).to.have.been.calledWith(match({
          lengthComputable: true,
          loaded: 50,
          total: 100
        }));
      });

      it("calls upload.onprogress on proxy event 'UploadRequest'", function() {
        xhr.upload.onprogress = spy();
        proxy.trigger('UploadProgress', {lengthComputable: true, loaded: 50, total: 100});
        expect(xhr.upload.onprogress).to.have.been.calledWith(match({
          lengthComputable: true,
          loaded: 50,
          total: 100
        }));
      });

      it("disposes of proxy on error proxy event states and 'finished'", function() {
        requestErrors.concat('finished').forEach((state) => {
          xhr.onreadystatechange = spy();
          proxy.trigger('StateChange', {state});
          expect(proxy._isDisposed).to.equal(true);
          sendRequest(xhr);
        });
      });

      it("doesn't dispose of proxy on proxy event states 'headers' and 'loading'", function() {
        ['headers', 'loading'].forEach((state) => {
          xhr.onreadystatechange = spy();
          proxy.trigger('StateChange', {state});
          expect(!proxy._isDisposed).to.equal(true);
          sendRequest(xhr);
        });
      });

    });

  });

  describe('abort', function() {

    let handlers = ['onprogress', 'onloadend', 'onabort'];

    it("doesn't fail without proxy", function() {
      expect(() => {
        xhr.abort();
      }).to.not.throw();
    });

    it('calls proxy abort', function() {
      sendRequest(xhr);
      xhr.abort();
      expect(proxy._nativeCall).to.have.been.calledWith('abort');
    });

    it("changes state to 'UNSENT' with states 'UNSENT' and 'OPENED' if send() not invoked", function() {
      xhr.abort();
      expect(xhr.readyState).to.equal(xhr.UNSENT);
      xhr.open('GET', 'http://foobar.com');
      xhr.abort();
      expect(xhr.readyState).to.equal(xhr.UNSENT);
    });

    it("changes state to 'UNSENT' with state 'DONE'", function() {
      sendRequest(xhr);
      proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
      xhr.abort();
      expect(xhr.readyState).to.equal(xhr.UNSENT);
    });

    it('dispatches readystatechange event when send interrupted', function() {
      xhr.onreadystatechange = spy();
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      xhr.abort();
      expect(xhr.onreadystatechange).to.have.been.called;
    });

    it("doesn't dispatch readystatechange event when send not interrupted", function() {
      xhr.onreadystatechange = spy();
      xhr.abort();
      expect(xhr.onreadystatechange).to.have.not.been.called;
    });

    it('dispatches progress events when send interrupted', function() {
      handlers.forEach((handler) => {
        xhr.open('GET', 'http://www.foo.com');
        xhr.send();
        xhr[handler] = spy();
        xhr.abort();
        expect(xhr[handler]).to.have.been.called;
      });
    });

    it('dispatches upload progress events when send interrupted', function() {
      handlers.forEach((handler) => {
        xhr.open('POST', 'http://www.foo.com');
        xhr.send('foo');
        xhr.upload[handler] = spy();
        xhr.abort();
        expect(xhr.upload[handler]).to.have.been.called;
      });
    });

    it("doesn't dispatch upload progress events when send interrupted and upload complete", function() {
      handlers.forEach((handler) => {
        xhr.open('GET', 'http://www.foo.com');
        xhr.send();
        proxy.trigger('StateChange', {state: 'headers'});
        xhr.upload[handler] = spy();
        xhr.abort();
        if (handler !== 'loadend') {
          expect(xhr.upload[handler]).to.have.not.been.called;
        } else {
          expect(xhr.upload[handler].calls.count()).to.eql(1);
        }
      });
    });

  });

  describe('setRequestHeader', function() {

    it("fails when state not 'opened'", function() {
      expect(() => {
        xhr.setRequestHeader();
      }).to.throw(Error,
        "InvalidStateError: Object's state must be 'OPENED', failed to execute 'setRequestHeader'"
      );
    });

    it('fails with invalid HTTP header field name', function() {
      xhr.open('GET', 'http://foo.com');
      expect(() => {
        xhr.setRequestHeader('foo bar', 'bar');
      }).to.throw(Error,
        "Invalid HTTP header name, failed to execute 'open'"
      );
    });

    it('fails with invalid HTTP header value name', function() {
      xhr.open('GET', 'http://foo.com');
      expect(() => {
        xhr.setRequestHeader('Foo', 'bar\n');
      }).to.throw(Error,
        "Invalid HTTP header value, failed to execute 'open'"
      );
    });

    it("doesn't fail with HTTP header values containing numbers", function() {
      xhr.open('GET', 'http://foo.com');
      expect(() => {
        xhr.setRequestHeader('Foo', '1234');
      }).to.not.throw();
    });

    it("doesn't fail with HTTP header values containing wildcards", function() {
      expect(() => {
        xhr.open('GET', 'http://foo.com');
        xhr.setRequestHeader('Foo', '*/*');
      }).to.not.throw();
    });

    it('fails when send invoked', function() {
      xhr.open('GET', 'http://foo.com');
      xhr.send();
      expect(() => {
        xhr.setRequestHeader('Foo', 'Bar');
      }).to.throw(Error,
        "InvalidStateError: cannot set request header if 'send()' invoked and request not completed"
      );
    });

  });

  describe('getAllResponseHeaders', function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it('initially returns an empty string', function() {
      expect(xhr.getAllResponseHeaders()).to.equal('');
    });

    it('returns empty string when state not allowed', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
      });
      xhr.open('GET', 'http://foo.com');
      expect(xhr.getAllResponseHeaders()).to.equal('');
    });

    it('returns empty string on error', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
      });
      proxy.trigger('StateChange', {state: 'error'});
      expect(xhr.getAllResponseHeaders()).to.equal('');
    });

    it('returns response headers', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        code: 200,
        headers: {
          Status: 'foo',
          'Set-Cookie': 'foo',
          'Set-Cookie2': 'foo',
          'Header-Name1': 'foo',
          'Header-Name2': 'bar, baz'
        }
      });
      expect(xhr.getAllResponseHeaders()).to.equal('Status: foo\nSet-Cookie: foo\nSet-Cookie2: foo\n'
        + 'Header-Name1: foo\nHeader-Name2: bar, baz');
    });

  });

  describe('getResponseHeader', function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it('returns null when readyState not allowed', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
      });
      xhr.open('GET', 'http://foo.com');
      expect(xhr.getResponseHeader('Header-Name1')).to.equal(null);
    });

    it('returns null on error', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
      });
      proxy.trigger('StateChange', {state: 'error'});
      expect(xhr.getResponseHeader('Header-Name1')).to.equal(null);
    });

    it('returns response header', function() {
      proxy.trigger('StateChange', {
        state: 'headers',
        headers: {'Header-Name1': 'foo', 'Header-Name2': 'bar, baz'}
      });
      expect(xhr.getResponseHeader('Header-Name1')).to.equal('foo');
    });

    it('returns null when header not found', function() {
      expect(xhr.getResponseHeader('Header-Name1')).to.equal(null);
    });

  });

  describe('upload', function() {

    it('is an EventTarget', function() {
      let handler1 = spy();
      let handler2 = spy();
      xhr.upload.addEventListener('foo', handler1);
      xhr.upload.addEventListener('bar', handler2);
      xhr.upload.removeEventListener('foo', handler1);
      xhr.upload.dispatchEvent({type: 'foo'});
      xhr.upload.dispatchEvent({type: 'bar'});
      expect(handler2).to.have.been.called;
      expect(handler1).to.have.not.been.called;
    });

    it('is readonly', function() {
      let obj = {Foo: 'Bar'};
      xhr.upload = obj;
      expect(xhr.upload).not.to.equal(obj);
    });

  });

  describe('reponseText', function() {

    it('is initialized with an empty string', function() {
      expect(xhr.responseText).to.equal('');
    });

    it('is readonly', function() {
      xhr.responseText = 'foo';
      expect(xhr.responseText).to.equal('');
    });

    describe('get', function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it('throws when responseType is not text', function() {
        xhr.responseType = 'arraybuffer';
        proxy.trigger('StateChange', {state: 'finished', response: 2});
        expect(() => {
          xhr.responseText;
        }).to.throw(Error, 'XHR responseText not accessible for non-text responseType');
      });

      it('returns responseText', function() {
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.responseText).to.equal('foo');
      });

      it('returns empty string when state not allowed', function() {
        proxy.trigger('StateChange', {state: 'headers', response: 'hello'});
        expect(xhr.responseText).to.equal('');
      });

      it('returns empty string on error', function() {
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'error'});
        expect(xhr.responseText).to.equal('');
      });

    });

  });

  describe('response', function() {

    it('is readonly', function() {
      xhr.response = 'foo';
      expect(xhr.response).to.equal('');
    });

    describe('get', function() {

      it('returns empty string when state not allowed', function() {
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'headers', response: 'hello'});
        expect(xhr.response).to.equal('');
      });

      it('returns empty string on error', function() {
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'error'});
        expect(xhr.response).to.equal('');
      });

      it('returns response text when responseType is empty', function() {
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.response).to.equal('foo');
      });

      it("returns response text when responseType is 'text'", function() {
        xhr.responseType = 'text';
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'finished', response: 'foo'});
        expect(xhr.response).to.equal('foo');
      });

      it("returns response data when responseType is 'arraybuffer'", function() {
        let buffer = new ArrayBuffer(8);
        xhr.responseType = 'arraybuffer';
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'finished', response: buffer});
        expect(xhr.response).to.equal(buffer);
      });

    });

  });

  describe('responseType', function() {

    it('is initialized with an empty string', function() {
      expect(xhr.responseType).to.equal('');
    });

    describe('set', function() {

      it('fails with bad state', function() {
        sendRequest(xhr);
        proxy.trigger('StateChange', {state: 'loading'});
        expect(() => {
          xhr.responseType = 'foo';
        }).to.throw(Error, 'The response type cannot be set when state is LOADING or DONE.');
      });

      it('ignores unknown responseType', function() {
        xhr.responseType = 'foo';
        expect(xhr.responseType).to.equal('');
      });

      it('ignores non-lowercase variant of accepted responseType', function() {
        xhr.responseType = 'Text';
        expect(xhr.responseType).to.equal('');
      });

      it('throws when setting unsupported response type', function() {
        expect(() => {
          xhr.responseType = 'document';
        }).to.throw(Error, "Unsupported responseType, only 'text' and 'arraybuffer' are supported");
      });

      it('accepts responseType `text`', function() {
        xhr.responseType = 'text';
        expect(xhr.responseType).to.equal('text');
      });

      it('accepts responseType `arraybuffer`', function() {
        xhr.responseType = 'arraybuffer';
        expect(xhr.responseType).to.equal('arraybuffer');
      });

    });

  });

  describe('readyState', function() {

    it("is initialized with the 'UNSENT' state value", function() {
      expect(xhr.timeout).to.equal(xhr.UNSENT);
    });

    it('is readonly', function() {
      xhr.readyState = 2;
      expect(xhr.readyState).to.equal(0);
    });

  });

  describe('timeout', function() {

    it('is initialized with 0', function() {
      expect(xhr.timeout).to.equal(0);
    });

    describe('set', function() {

      it("doesn't set timeout if timeout not a number", function() {
        xhr.timeout = 'foo';
        expect(xhr.timeout).to.equal(0);
      });

      it('sets timeout to the rounded nearest integer of value', function() {
        xhr.timeout = 2.5;
        expect(xhr.timeout).to.equal(3);
        xhr.timeout = 2.4;
        expect(xhr.timeout).to.equal(2);
      });

    });

  });

  describe('status', function() {

    it('is initialized with 0', function() {
      expect(xhr.status).to.equal(0);
    });

    it('is readonly', function() {
      xhr.status = 2;
      expect(xhr.status).to.equal(0);
    });

    describe('get', function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it('returns 0 when state not allowed', function() {
        proxy.trigger('StateChange', {state: 'headers', code: 200});
        xhr.open('GET', 'http://foo.com');
        expect(xhr.status).to.equal(0);
      });

      it('returns 0 on error', function() {
        proxy.trigger('StateChange', {state: 'headers', code: 200});
        proxy.trigger('StateChange', {state: 'error'});
        expect(xhr.status).to.equal(0);
      });

    });

  });

  describe('statusText', function() {

    it('is initialized with an empty string', function() {
      expect(xhr.statusText).to.equal('');
    });

    it('is readonly', function() {
      xhr.statusText = 'OK';
      expect(xhr.statusText).to.equal('');
    });

    describe('get', function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it('returns empty string when state not allowed', function() {
        proxy.trigger('StateChange', {state: 'headers', message: 'OK'});
        xhr.open('GET', 'http://foo.com');
        expect(xhr.statusText).to.equal('');
      });

      it('returns empty string on error', function() {
        proxy.trigger('StateChange', {state: 'headers', message: 'OK'});
        proxy.trigger('StateChange', {state: 'error'});
        expect(xhr.statusText).to.equal('');
      });

    });

  });

  describe('withCredentials', function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it('is initialized with false', function() {
      expect(xhr.withCredentials).to.equal(false);
    });

    describe('set', function() {

      it('fails with state other than UNSENT or OPENED', function() {
        proxy.trigger('StateChange', {state: 'headers', message: 'OK'});
        expect(() => {
          xhr.withCredentials = true;
        }).to.throw(Error, "InvalidStateError: state must be 'UNSENT' or 'OPENED' when setting withCredentials");
      });

      it('fails when send invoked', function() {
        xhr.open('Foo', 'http://www.foo.com');
        xhr.send();
        expect(() => {
          xhr.withCredentials = true;
        }).to.throw(Error, "InvalidStateError: 'send' invoked, failed to set 'withCredentials'");
      });

      it('sets withCredentials', function() {
        xhr.open('GET', 'http://www.foo.com');
        xhr.withCredentials = true;
        expect(xhr.withCredentials).to.equal(true);
      });

      it("doesn't set withCredentials if value not boolean", function() {
        xhr.open('GET', 'http://www.foo.com');
        xhr.withCredentials = 'foo';
        expect(xhr.withCredentials).to.equal(false);
      });

    });

  });

  let eventHandlers = {
    eventTypes: [
      'loadstart', 'readystatechange', 'load', 'loadend', 'progress', 'timeout', 'abort', 'error'
    ],
    uploadEventTypes: ['progress', 'loadstart', 'load', 'loadend', 'timeout', 'abort', 'error']
  };

  let describeEventHandlers = function(name, eventTypes, property) {

    let getTarget = function(property) {
      if (property) {
        return xhr[property];
      }
      return xhr;
    };

    describe(name, function() {

      it('are initialized with null', function() {
        eventTypes.forEach((type) => {
          let handler = 'on' + type;
          expect(getTarget(property)[handler]).to.equal(null);
        });
      });

      describe('set', function() {

        it("doesn't set value when value not a function", function() {
          eventTypes.forEach((type) => {
            let handler = 'on' + type;
            getTarget(property)[handler] = 'foo';
            expect(getTarget(property)[handler]).to.equal(null);
          });
        });

        it('sets value to function', function() {
          let foo = function() {};
          eventTypes.forEach((type) => {
            let handler = 'on' + type;
            getTarget(property)[handler] = foo;
            expect(getTarget(property)[handler]).to.equal(foo);
          });
        });

        it('replaces existing listener', function() {
          let handler1 = spy();
          let handler2 = spy();
          eventTypes.forEach((type) => {
            let handler = 'on' + type;
            getTarget(property)[handler] = handler1;
            getTarget(property)[handler] = handler2;
            getTarget(property).dispatchEvent({
              type
            });
            expect(handler1).to.have.not.been.called;
            expect(handler2).to.have.been.called;
          });
        });

      });

    });

  };

  describeEventHandlers('event handlers', eventHandlers.eventTypes);
  describeEventHandlers('upload event handlers', eventHandlers.uploadEventTypes, 'upload');

});

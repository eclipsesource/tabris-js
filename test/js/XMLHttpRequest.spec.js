/**
 * Copyright (c) 2014 EclipseSource.
 * All rights reserved.
 */

describe("XMLHttpRequest", function() {

  var nativeBridge;
  var proxy;
  var xhr;

  beforeEach(function() {
    nativeBridge = new NativeBridgeSpy();
    tabris._reset();
    tabris._start(nativeBridge);
    spyOn(tabris, "create").and.callFake(function(type, properties) {
      proxy = tabris.Proxy.create(type, properties);
      proxy.call = jasmine.createSpy("call");
      return proxy;
    });
    xhr = new tabris.XMLHttpRequest();
  });

  afterEach(function() {
    nativeBridge = null;
    xhr = null;
  });

  var sendRequest = function(xhr) {
    xhr.open("GET", "http://foo.com");
    xhr.send();
  };

  it("is an EventTarget", function() {
    var handler1 = jasmine.createSpy("handler1");
    var handler2 = jasmine.createSpy("handler2");
    xhr.addEventListener("foo", handler1);
    xhr.addEventListener("bar", handler2);
    xhr.removeEventListener("foo", handler1);
    xhr.dispatchEvent({type: "foo"});
    xhr.dispatchEvent({type: "bar"});
    expect(handler2).toHaveBeenCalled();
    expect(handler1).not.toHaveBeenCalled();
  });

  describe("open", function() {

    it("fails without method", function() {
      expect(function() {
        xhr.open(undefined, "http://foo.com");
      }).toThrowError("Method argument should be specified to execute 'open'");
    });

    it("fails without url", function() {
      expect(function() {
        xhr.open("foo", undefined);
      }).toThrowError("URL argument should be specified to execute 'open'");
    });

    it("fails for synchronous requests", function() {
      expect(function() {
        xhr.open("GET", "http://foo.com", false);
      }).toThrowError("Only asynchronous request supported.");
    });

    it("sets async to true when argument ommited", function() {
      xhr.open("GET", "http://foo.com");
    });

    it("fails with method name containing space", function() {
      expect(function() {
        xhr.open("ba r", "http://foo.com");
      }).toThrowError("Invalid HTTP method, failed to execute 'open'");
    });

    it("doesn't fail with method name containing '!'", function() {
      xhr.open("ba!r", "http://foo.com");
    });

    it("fails with method name containing (del)", function() {
      expect(function() {
        xhr.open("ba" + String.fromCharCode(127) + "r", "http://foo.com");
      }).toThrowError("Invalid HTTP method, failed to execute 'open'");
    });

    it("doesn't fail with method name containing '~'", function() {
      xhr.open("ba~r", "http://foo.com");
    });

    it("fails with forbidden method name", function() {
      expect(function() {
        xhr.open("CONNECT", "http://foo.com");
      }).toThrowError("SecurityError: 'CONNECT' HTTP method is not secure, failed to execute 'open'");
    });

    it("fails with forbidden non-uppercase method name", function() {
      expect(function() {
        xhr.open("coNnEcT", "http://foo.com");
      }).toThrowError("SecurityError: 'CONNECT' HTTP method is not secure, failed to execute 'open'");
    });

    // URL validation commented out as Rhino crashes with an OOM-error with several URLs
    // it("fails with malformed URI", function() {
    //   expect(function() {
    //     xhr.open("GET", "http://-");
    //   }).toThrowError("Malformed URI, failed to execute 'open'");
    // });

    it("sets object state to 'OPENED'", function() {
      xhr.open("GET", "http://foo.com");
      expect(xhr.readyState).toBe(1);
    });

    it("triggers a StateChange event", function() {
      xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
      xhr.open("GET", "http://foo.com");
      expect(xhr.onreadystatechange).toHaveBeenCalled();
    });

    it("resets requestHeaders", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.setRequestHeader("Foo", "Bar");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {}
      }));
    });

    it("resets responseText", function() {
      sendRequest(xhr);
      proxy.trigger("StateChange", {state: "finished", response: "foo"});
      xhr.open("GET", "http://foo.com");
      expect(xhr.responseText).toBe("");
    });

    it("sets sendInvoked to false", function() {
      sendRequest(xhr);
      proxy.trigger("StateChange", {state: "finished", response: "foo"});
      xhr.open("GET", "http://foo.com");
      xhr.send();
      xhr.open("GET", "http://foo.com");
      xhr.abort();
      expect(xhr.readyState).toBe(xhr.UNSENT);
    });

    it("sets url username and password if url relative", function() {
      xhr.withCredentials = true;
      xhr.open("GET", "index.json", true, "user", "password");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Authorization": "Basic user:password"}
      }));
    });

    it("doesn't set url username and password if url relative and username or password null",
    function() {
      xhr.withCredentials = true;
      xhr.open("GET", "index.json", true, "user", null);
      xhr.send();
      expect(proxy.call).not.toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Authorization": "Basic user:password"}
      }));
    });

  });

  describe("send", function() {

    it("creates proxy", function() {
      xhr.open("GET", "http://www.foo.com");
      xhr.send();
      expect(tabris.create).toHaveBeenCalledWith("tabris.HttpRequest");
    });

    it("fails when state not 'opened'", function() {
      expect(function() {
        xhr.send();
      }).toThrowError("InvalidStateError: Object's state must be 'OPENED', failed to execute 'send'");
    });

    it("fails if send invoked", function() {
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(function() {
        xhr.send();
      }).toThrowError("InvalidStateError: 'send' invoked, failed to execute 'send'");
    });

    it("calls proxy send with request URL specified as open argument", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        url: "http://foo.com"
      }));
    });

    it("calls proxy send with method specified as open argument", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        method: "GET"
      }));
    });

    it("calls proxy send with timeout property", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.timeout = 2000;
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        timeout: 2000
      }));
    });

    it("calls proxy send with headers property", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.setRequestHeader("Foo", "Bar");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Foo": "Bar"}
      }));
    });

    it("calls proxy send with data property", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("POST", "http://foo.com");
      xhr.send("foo");
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        data: "foo"
      }));
    });

    it("calls proxy send with null data if request method is HEAD or GET", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.send("foo");
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        data: null
      }));
      xhr.open("HEAD", "http://foo.com");
      xhr.send("foo");
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        data: null
      }));
    });

    it("calls proxy send with headers property and appended header", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.open("GET", "http://foo.com");
      xhr.setRequestHeader("Foo", "Bar");
      xhr.setRequestHeader("Foo", "Baz");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Foo": "Bar, Baz"}
      }));
    });

    it("resets error", function() {
      sendRequest(xhr);
      xhr.open("GET", "http://foobar.com");
      xhr.send();
      proxy.trigger("StateChange", {state: "error"});
      expect(xhr.responseText).toBe("");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      proxy.trigger("StateChange", {state: "finished", response: "foo"});
      expect(xhr.responseText).toBe("foo");
    });

    it("resets uploadCompleted", function() {
      xhr.upload.onprogress = jasmine.createSpy("onprogress");
      xhr.open("POST", "http://foo.com");
      proxy.trigger("StateChange", {state: "headers"});
      proxy.trigger("StateChange", {state: "error"});
      expect(xhr.upload.onprogress).not.toHaveBeenCalled();
      xhr.send("foo");
      proxy.trigger("StateChange", {state: "error"});
      expect(xhr.upload.onprogress).toHaveBeenCalled();
    });

    it("sets uploadCompleted when requestBody empty", function() {
      xhr.upload.onloadstart = jasmine.createSpy("onloadstart");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(xhr.upload.onloadstart).not.toHaveBeenCalled();
    });

    it("calls onloadstart", function() {
      xhr.onloadstart = jasmine.createSpy("onloadstart");
      xhr.open("GET", "http://foobar.com");
      xhr.send();
      expect(xhr.onloadstart).toHaveBeenCalled();
    });

    it("calls upload onloadstart", function() {
      xhr.upload.onloadstart = jasmine.createSpy("onloadstart");
      xhr.open("POST", "http://foobar.com");
      xhr.send("foo");
      expect(xhr.upload.onloadstart).toHaveBeenCalled();
    });

    it("sends basic access authentication header when withCredentials true", function() {
      xhr.withCredentials = true;
      xhr.open("GET", "http://user:password@foobar.com");
      xhr.send();
      expect(proxy.call).toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Authorization": "Basic user:password"}
      }));
    });

    it("doesn't send basic access authentication header when withCredentials false", function() {
      xhr.open("GET", "http://user:password@foobar.com");
      xhr.send();
      expect(proxy.call).not.toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Authorization": "Basic user:password"}
      }));
    });

    it("doesn't send basic access authentication header when userdata null", function() {
      xhr.withCredentials = true;
      xhr.open("GET", "http://foobar.com");
      xhr.send();
      expect(proxy.call).not.toHaveBeenCalledWith("send", jasmine.objectContaining({
        headers: {"Authorization": "Basic user:password"}
      }));
    });

    describe("proxy StateChange callback", function() {

      var requestErrors = ["timeout", "abort", "error"];
      var progressEvents =  ["load", "loadend"];

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("doesn't fail when onreadystatechange not implemented", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
      });

      it("sets readystatechange event type to 'readystatechange'", function() {
        xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.onreadystatechange).toHaveBeenCalledWith(jasmine.objectContaining({
          type: "readystatechange"
        }));
      });

      it("calls onreadystatechange on proxy event state 'headers'", function() {
        xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
        proxy.trigger("StateChange", {state: "headers"});
        expect(xhr.onreadystatechange).toHaveBeenCalled();
      });

      it("calls onreadystatechange on proxy event state 'loading'", function() {
        xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
        proxy.trigger("StateChange", {state: "loading"});
        expect(xhr.onreadystatechange).toHaveBeenCalled();
      });

      it("calls onreadystatechange on proxy event state 'finished'", function() {
        xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
        proxy.trigger("StateChange", {state: "finished"});
        expect(xhr.onreadystatechange).toHaveBeenCalled();
      });

      it("calls upload progress events on proxy event state 'headers'", function() {
        progressEvents.forEach(function(event){
          var handler = "on" + event;
          xhr.upload[handler] = jasmine.createSpy(handler);
          proxy.trigger("StateChange", {state: "headers"});
          expect(xhr.upload[handler]).toHaveBeenCalled();
        });
      });

      it("calls progress events on proxy event state 'finished'", function() {
        progressEvents.forEach(function(event){
          var handler = "on" + event;
          xhr[handler] = jasmine.createSpy(handler);
          proxy.trigger("StateChange", {state: "finished"});
          expect(xhr[handler]).toHaveBeenCalled();
          sendRequest(xhr);
        });
      });

      it("calls upload progress events on proxy event state 'finished'", function() {
        progressEvents.forEach(function(event){
          var handler = "on" + event;
          xhr.upload[handler] = jasmine.createSpy(handler);
          proxy.trigger("StateChange", {state: "finished"});
          expect(xhr.upload[handler]).toHaveBeenCalled();
          sendRequest(xhr);
        });
      });

      it("sets target and currentTarget to XHR", function() {
        xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.onreadystatechange).toHaveBeenCalledWith(jasmine.objectContaining({
          target: xhr,
          currentTarget: xhr
        }));
      });

      it("sets state to 'HEADERS_RECEIVED' when proxy event state 'headers'", function() {
        proxy.trigger("StateChange", {state: "headers"});
        expect(xhr.readyState).toBe(xhr.HEADERS_RECEIVED);
      });

      it("sets HTTP status code to 'code' when state 'headers'", function() {
        proxy.trigger("StateChange", {state: "headers", code: 200});
        expect(xhr.status).toBe(200);
      });

      it("sets HTTP statusText to 'message' when state 'headers'", function() {
        proxy.trigger("StateChange", {state: "headers", message: "OK"});
        expect(xhr.statusText).toBe("OK");
      });

      it("sets response headers to headers when proxy event state 'headers'", function() {
        proxy.trigger("StateChange", {
          state: "headers",
          code: 200,
          headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
        });
        expect(xhr.getAllResponseHeaders()).toBe("Header-Name1: foo\nHeader-Name2: bar, baz");
      });

      it("sets state to 'LOADING' when proxy event state 'loading'", function() {
        proxy.trigger("StateChange", {state: "loading"});
        expect(xhr.readyState).toBe(xhr.LOADING);
      });

      it("sets state to 'DONE' when proxy event state 'finished'", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.readyState).toBe(xhr.DONE);
      });

      it("sets responseText to 'response' when proxy event state 'finished'", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.responseText).toBe("foo");
      });

      it("sets state to 'DONE' on request error", function() {
        requestErrors.forEach(function(entry) {
          proxy.trigger("StateChange", {state: entry});
          expect(xhr.readyState).toBe(xhr.DONE);
        });
      });

      it("calls onreadystatechange on request error", function() {
        requestErrors.forEach(function(entry) {
          xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
          proxy.trigger("StateChange", {state: entry});
          expect(xhr.onreadystatechange).toHaveBeenCalled();
        });
      });

      it("calls progress event handlers on request error", function() {
        requestErrors.forEach(function(entry) {
          var handler = "on" + entry;
          xhr.onprogress = jasmine.createSpy("onprogress");
          xhr[handler] = jasmine.createSpy(handler);
          xhr.onloadend = jasmine.createSpy("onloadend");
          proxy.trigger("StateChange", {state: entry});
          expect(xhr.onprogress).toHaveBeenCalled();
          expect(xhr[handler]).toHaveBeenCalled();
          expect(xhr.onloadend).toHaveBeenCalled();
        });
      });

      it("calls upload progress event handlers on request error", function() {
        requestErrors.forEach(function(entry) {
          var handler = "on" + entry;
          xhr.upload.onprogress = jasmine.createSpy("onprogress");
          xhr.upload[handler] = jasmine.createSpy(handler);
          xhr.upload.onloadend = jasmine.createSpy("onloadend");
          xhr.open("POST", "http://foo.com");
          xhr.send("foo");
          proxy.trigger("StateChange", {state: entry});
          expect(xhr.upload.onprogress).toHaveBeenCalled();
          expect(xhr.upload[handler]).toHaveBeenCalled();
          expect(xhr.upload.onloadend).toHaveBeenCalled();
        });
      });

      it("doesn't call upload event handler on request error when upload complete", function() {
        requestErrors.forEach(function(entry) {
          var handler = "on" + entry;
          xhr.upload.onprogress = jasmine.createSpy("onprogress");
          xhr.upload[handler] = jasmine.createSpy(handler);
          xhr.upload.onloadend = jasmine.createSpy("onloadend");
          xhr.open("GET", "http://foo.com");
          xhr.send();
          proxy.trigger("StateChange", {state: "headers"});
          proxy.trigger("StateChange", {state: entry});
          expect(xhr.upload.onprogress).not.toHaveBeenCalled();
          expect(xhr.upload[handler]).not.toHaveBeenCalled();
          expect(xhr.upload.onloadend.calls.count()).toEqual(1); // called on "headers" stateChange
        });
      });

      it("sets error to true on request error", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        sendRequest(xhr);
        proxy.trigger("StateChange", {state: "error"});
        expect(xhr.responseText).toBe("");
      });

      it("calls onprogress on proxy event 'DownloadProgress'", function() {
        xhr.onprogress = jasmine.createSpy("onprogress");
        proxy.trigger("DownloadProgress", {lengthComputable: true, loaded: 50, total: 100});
        expect(xhr.onprogress).toHaveBeenCalledWith(jasmine.objectContaining({
          lengthComputable: true,
          loaded: 50,
          total: 100
        }));
      });

      it("calls upload.onprogress on proxy event 'UploadRequest'", function() {
        xhr.upload.onprogress = jasmine.createSpy("onprogress");
        proxy.trigger("UploadProgress", {lengthComputable: true, loaded: 50, total: 100});
        expect(xhr.upload.onprogress).toHaveBeenCalledWith(jasmine.objectContaining({
          lengthComputable: true,
          loaded: 50,
          total: 100
        }));
      });

    });

  });

  describe("abort", function() {

    var handlers = ["onprogress", "onloadend", "onabort"];

    it("doesn't fail without proxy", function() {
      xhr.abort();
    });

    it("calls proxy abort", function() {
      sendRequest(xhr);
      proxy.call = jasmine.createSpy("call");
      xhr.abort();
      expect(proxy.call).toHaveBeenCalledWith("abort");
    });

    it("changes state to 'UNSENT' with states 'UNSENT' and 'OPENED' if send() not invoked", function() {
      xhr.abort();
      expect(xhr.readyState).toBe(xhr.UNSENT);
      xhr.open("GET", "http://foobar.com");
      xhr.abort();
      expect(xhr.readyState).toBe(xhr.UNSENT);
    });

    it("changes state to 'UNSENT' with state 'DONE'", function() {
      sendRequest(xhr);
      proxy.trigger("StateChange", {state: "finished", response: "foo"});
      xhr.abort();
      expect(xhr.readyState).toBe(xhr.UNSENT);
    });

    it("dispatches readystatechange event when send interrupted", function() {
      xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
      xhr.open("GET", "http://foo.com");
      xhr.send();
      xhr.abort();
      expect(xhr.onreadystatechange).toHaveBeenCalled();
    });

    it("doesn't dispatch readystatechange event when send not interrupted", function() {
      xhr.onreadystatechange = jasmine.createSpy("onreadystatechange");
      xhr.abort();
      expect(xhr.onreadystatechange).not.toHaveBeenCalled();
    });

    it("dispatches progress events when send interrupted", function() {
      handlers.forEach(function(handler) {
        xhr.open("GET", "http://www.foo.com");
        xhr.send();
        xhr[handler] = jasmine.createSpy(handler);
        xhr.abort();
        expect(xhr[handler]).toHaveBeenCalled();
      });
    });

    it("dispatches upload progress events when send interrupted", function() {
      handlers.forEach(function(handler) {
        xhr.open("POST", "http://www.foo.com");
        xhr.send("foo");
        xhr.upload[handler] = jasmine.createSpy(handler);
        xhr.abort();
        expect(xhr.upload[handler]).toHaveBeenCalled();
      });
    });

    it("doesn't dispatch upload progress events when send interrupted and upload complete", function() {
      handlers.forEach(function(handler) {
        xhr.open("GET", "http://www.foo.com");
        xhr.send();
        proxy.trigger("StateChange", {state: "headers"});
        xhr.upload[handler] = jasmine.createSpy(handler);
        xhr.abort();
        if(handler !== "loadend") {
          expect(xhr.upload[handler]).not.toHaveBeenCalled();
        } else {
          expect(xhr.upload[handler].calls.count()).toEqual(1);
        }
      });
    });

  });

  describe("setRequestHeader", function() {

    it("fails when state not 'opened'", function() {
      expect(function() {
        xhr.setRequestHeader();
      }).toThrowError(
        "InvalidStateError: Object's state must be 'OPENED', failed to execute 'setRequestHeader'"
      );
    });

    it("fails with invalid HTTP header field name", function() {
      xhr.open("GET", "http://foo.com");
      expect(function() {
        xhr.setRequestHeader("foo bar", "bar");
      }).toThrowError(
        "Invalid HTTP header name, failed to execute 'open'"
      );
    });

    it("fails with invalid HTTP header value name", function() {
      xhr.open("GET", "http://foo.com");
      expect(function() {
        xhr.setRequestHeader("Foo", "bar\n");
      }).toThrowError(
        "Invalid HTTP header value, failed to execute 'open'"
      );
    });

    it("doesn't fail with HTTP header values containing wildcards", function() {
      xhr.open("GET", "http://foo.com");
      xhr.setRequestHeader("Foo", "*/*");
    });

    it("fails with case variant of forbidden header", function() {
      xhr.open("GET", "http://foo.com");
      expect(function() {
        xhr.setRequestHeader("acCept-charseT", "foo");
      }).toThrowError(
        "Cannot set forbidden header 'acCept-charseT'"
      );
    });

    it("fails when send invoked", function() {
      xhr.open("GET", "http://foo.com");
      xhr.send();
      expect(function() {
        xhr.setRequestHeader("Foo", "Bar");
      }).toThrowError(
        "InvalidStateError: cannot set request header if 'send()' invoked and request not completed"
      );
    });

  });

  describe("getAllResponseHeaders", function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it("initially returns an empty string", function() {
      expect(xhr.getAllResponseHeaders()).toBe("");
    });

    it("returns empty string when state not allowed", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
      });
      xhr.open("GET", "http://foo.com");
      expect(xhr.getAllResponseHeaders()).toBe("");
    });

    it("returns empty string on error", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
      });
      proxy.trigger("StateChange", {state: "error"});
      expect(xhr.getAllResponseHeaders()).toBe("");
    });

    it("returns response headers without forbidden headers", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        code: 200,
        headers: {
          "Status": "foo",
          "Set-Cookie": "foo",
          "Set-Cookie2": "foo",
          "Header-Name1": "foo",
          "Header-Name2": "bar, baz"
        }
      });
      expect(xhr.getAllResponseHeaders()).toBe("Header-Name1: foo\nHeader-Name2: bar, baz");
    });

  });

  describe("getResponseHeader", function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it("returns null when readyState not allowed", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
      });
      xhr.open("GET", "http://foo.com");
      expect(xhr.getResponseHeader("Header-Name1")).toBe(null);
    });

    it("returns null on error", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
      });
      proxy.trigger("StateChange", {state: "error"});
      expect(xhr.getResponseHeader("Header-Name1")).toBe(null);
    });

    it("returns response header", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {"Header-Name1": "foo", "Header-Name2": "bar, baz"}
      });
      expect(xhr.getResponseHeader("Header-Name1")).toBe("foo");
    });

    it("doesn't return forbidden response headers", function() {
      proxy.trigger("StateChange", {
        state: "headers",
        headers: {
          "Status": "foo",
          "Set-Cookie": "foo",
          "Set-Cookie2": "foo",
          "Header-Name1": "foo",
          "Header-Name2": "bar, baz"
        }
      });
      expect(xhr.getResponseHeader("Status")).toBe(null);
      expect(xhr.getResponseHeader("Set-Cookie")).toBe(null);
      expect(xhr.getResponseHeader("Set-Cookie2")).toBe(null);
    });

    it("returns null when header not found", function() {
      expect(xhr.getResponseHeader("Header-Name1")).toBe(null);
    });

  });

  describe("upload", function() {

    it("is initialized with an empty object", function() {
      expect(xhr.upload === JSON.stringify({}));
    });

    it("is readonly", function() {
      xhr.upload = {"Foo": "Bar"};
      expect(xhr.upload === JSON.stringify({}));
    });

  });

  describe("reponseText", function() {

    it("is initialized with an empty string", function() {
      expect(xhr.responseText).toBe("");
    });

    it("is readonly", function() {
      xhr.responseText = "foo";
      expect(xhr.responseText).toBe("");
    });

    describe("get", function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("fails when responseText was not a string", function() {
        proxy.trigger("StateChange", {state: "finished", response: 2});
        expect(function() {
          /*jshint unused: false */
          var responseText = xhr.responseText;
        }).toThrowError("IllegalStateError: responseText is not a string");
      });

      it("returns responseText", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.responseText).toBe("foo");
      });

      it("returns empty string when state not allowed", function() {
        proxy.trigger("StateChange", {state: "headers", response: "hello"});
        expect(xhr.responseText).toBe("");
      });

      it("returns empty string on error", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        sendRequest(xhr);
        proxy.trigger("StateChange", {state: "error"});
        expect(xhr.responseText).toBe("");
      });

      it("fails with invalid reponseText type", function() {
        proxy.trigger("StateChange", {state: "finished", response:["foo"]});
        expect(function() {
          /*jshint unused: false */
          var responseText = xhr.responseText;
        }).toThrowError("IllegalStateError: responseText is not a string");
      });

    });

  });

  describe("response", function() {

    it("is readonly", function() {
      xhr.response = "foo";
      expect(xhr.response).toBe("");
    });

    describe("get", function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("returns empty string when state not allowed", function() {
        proxy.trigger("StateChange", {state: "headers", response: "hello"});
        expect(xhr.response).toBe("");
      });

      it("returns empty string on error", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        sendRequest(xhr);
        proxy.trigger("StateChange", {state: "error"});
        expect(xhr.response).toBe("");
      });

      it("returns responseText when responseType empty string or 'text'", function() {
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.response).toBe("foo");
        sendRequest(xhr);
        xhr.open("GET", "http://foo.com");
        xhr.responseType = "text";
        proxy.trigger("StateChange", {state: "finished", response: "foo"});
        expect(xhr.response).toBe("foo");
      });

    });

  });

  describe("responseType", function() {

    it("is initialized with an empty string", function() {
      expect(xhr.responseType).toBe("");
    });

    describe("set", function() {

      it("fails with bad state", function() {
        sendRequest(xhr);
        proxy.trigger("StateChange", {state: "loading"});
        expect(function() {
          xhr.responseType = "foo";
        }).toThrowError(
          "InvalidStateError: state must not be 'LOADING' or 'DONE' when setting responseType"
        );
      });

      it("fails to set bad responseType", function() {
        xhr.responseType = "foo";
        expect(xhr.responseType).toBe("");
      });

      it("fails to set case variant of accepted responseType", function() {
        xhr.responseType = "tExt";
        expect(xhr.responseType).toBe("");
      });

      it("fails to set response type which is not 'text'", function() {
        expect(function() {
          xhr.responseType = "document";
        }).toThrowError("Only the 'text' response type is supported.");
      });

      it("sets responseType", function() {
        xhr.responseType = "text";
        expect(xhr.responseType).toBe("text");
      });

    });

  });

  describe("readyState", function() {

    it("is initialized with the 'UNSENT' state value", function() {
      expect(xhr.timeout).toBe(xhr.UNSENT);
    });

    it("is readonly", function() {
      xhr.readyState = 2;
      expect(xhr.readyState).toBe(0);
    });

  });

  describe("timeout", function() {

    it("is initialized with 0", function() {
      expect(xhr.timeout).toBe(0);
    });

    describe("set", function() {

      it("doesn't set timeout if timeout not a number", function() {
        xhr.timeout = "foo";
        expect(xhr.timeout).toBe(0);
      });

      it("sets timeout to the rounded nearest integer of value", function() {
        xhr.timeout = 2.5;
        expect(xhr.timeout).toBe(3);
        xhr.timeout = 2.4;
        expect(xhr.timeout).toBe(2);
      });

    });

  });

  describe("status", function() {

    it("is initialized with 0", function() {
      expect(xhr.status).toBe(0);
    });

    it("is readonly", function() {
      xhr.status = 2;
      expect(xhr.status).toBe(0);
    });

    describe("get", function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("returns 0 when state not allowed", function() {
        proxy.trigger("StateChange", {state: "headers", code: 200});
        xhr.open("GET", "http://foo.com");
        expect(xhr.status).toBe(0);
      });

      it("returns 0 on error", function() {
        proxy.trigger("StateChange", {state: "headers", code: 200});
        proxy.trigger("StateChange", {state: "error"});
        expect(xhr.status).toBe(0);
      });

    });

  });

  describe("statusText", function() {

    it("is initialized with an empty string", function() {
      expect(xhr.statusText).toBe("");
    });

    it("is readonly", function() {
      xhr.statusText = "OK";
      expect(xhr.statusText).toBe("");
    });

    describe("get", function() {

      beforeEach(function() {
        sendRequest(xhr);
      });

      it("returns empty string when state not allowed", function() {
        proxy.trigger("StateChange", {state: "headers", message: "OK"});
        xhr.open("GET", "http://foo.com");
        expect(xhr.statusText).toBe("");
      });

      it("returns empty string on error", function() {
        proxy.trigger("StateChange", {state: "headers", message: "OK"});
        proxy.trigger("StateChange", {state: "error"});
        expect(xhr.statusText).toBe("");
      });

    });

  });

  describe("withCredentials", function() {

    beforeEach(function() {
      sendRequest(xhr);
    });

    it("is initialized with false", function() {
      expect(xhr.withCredentials).toBe(false);
    });

    describe("set", function() {

      it("fails with state other than UNSENT or OPENED", function() {
        proxy.trigger("StateChange", {state: "headers", message: "OK"});
        expect(function() {
          xhr.withCredentials = true;
        }).toThrowError(
          "InvalidStateError: state must be 'UNSENT' or 'OPENED' when setting withCredentials"
        );
      });

      it("fails when send invoked", function() {
        xhr.open("Foo", "http://www.foo.com");
        xhr.send();
        expect(function() {
          xhr.withCredentials = true;
        }).toThrowError("InvalidStateError: 'send' invoked, failed to set 'withCredentials'");
      });

      it("sets withCredentials", function() {
        xhr.open("GET", "http://www.foo.com");
        xhr.withCredentials = true;
        expect(xhr.withCredentials).toBe(true);
      });

      it("doesn't set withCredentials if value not boolean", function() {
        xhr.open("GET", "http://www.foo.com");
        xhr.withCredentials = "foo";
        expect(xhr.withCredentials).toBe(false);
      });

    });

  });

  var eventHandlers = {
    eventTypes: [
      "loadstart", "readystatechange", "load", "loadend", "progress", "timeout", "abort", "error"
    ],
    uploadEventTypes: ["progress", "loadstart", "load", "loadend", "timeout", "abort", "error"]
  };

  var describeEventHandlers = function(name, eventTypes, property) {

    var getTarget = function(property) {
      if (property) {
        return xhr[property];
      }
      return xhr;
    };

    describe(name, function() {

      it("are initialized with null", function() {
        eventTypes.forEach(function(type) {
          var handler = "on" + type;
          expect(getTarget(property)[handler]).toBe(null);
        });
      });

      describe("set", function() {

        it("doesn't set value when value not a function", function() {
          eventTypes.forEach(function(type) {
            var handler = "on" + type;
            getTarget(property)[handler] = "foo";
            expect(getTarget(property)[handler]).toBe(null);
          });
        });

        it("sets value to function", function() {
          var foo = function() {};
          eventTypes.forEach(function(type) {
            var handler = "on" + type;
            getTarget(property)[handler] = foo;
            expect(getTarget(property)[handler]).toBe(foo);
          });
        });

        it("replaces existing listener", function() {
          var handler1 = jasmine.createSpy("handler1");
          var handler2 = jasmine.createSpy("handler2");
          eventTypes.forEach(function(type) {
            var handler = "on" + type;
            getTarget(property)[handler] = handler1;
            getTarget(property)[handler] = handler2;
            getTarget(property).dispatchEvent({
              type: type
            });
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).toHaveBeenCalled();
          });
        });

      });

    });

  };

  describeEventHandlers("event handlers", eventHandlers.eventTypes);
  describeEventHandlers("upload event handlers", eventHandlers.uploadEventTypes, "upload");

});

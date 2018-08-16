import {expect, mockTabris, spy} from '../../test';
import ClientStub from '../ClientStub';
import WebView from '../../../src/tabris/widgets/WebView';

describe('WebView', () => {

  let client, webView;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    webView = new WebView({url: 'http://wikipedia.com'});
  });

  function checkListen(event) {
    let listen = client.calls({op: 'listen', id: webView.cid});
    expect(listen.length).to.equal(1);
    expect(listen[0].event).to.equal(event);
    expect(listen[0].listen).to.equal(true);
  }

  describe('when created', () => {

    it('creates a WebView', () => {
      let create = client.calls({op: 'create', id: webView.cid})[0];
      expect(create.type).to.equal('tabris.WebView');
      expect(create.id).to.equal(webView.cid);
      expect(create.properties.url).to.equal('http://wikipedia.com');
    });

  });

  describe('method', () => {

    it('goBack() calls "goBack"', () => {
      webView.goBack();

      let call = client.calls({op: 'call', id: webView.cid});
      expect(call.length).to.equal(1);
      expect(call[0].method).to.equal('goBack');
    });

    it('goForward() calls "goForward"', () => {
      webView.goForward();

      let call = client.calls({op: 'call', id: webView.cid});
      expect(call.length).to.equal(1);
      expect(call[0].method).to.equal('goForward');
    });

  });

  describe('event', () => {

    it('onLoad', () => {
      const listener = spy();
      webView.onLoad(listener);

      tabris._notify(webView.cid, 'load', {});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: webView});
      checkListen('load');
    });

  });

});

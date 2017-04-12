import {expect, mockTabris} from '../../test';
import ClientStub from '../ClientStub';
import WebView from '../../../src/tabris/widgets/WebView';

describe('WebView', () => {

  let client, webView;

  beforeEach(() => {
    client = new ClientStub();
    mockTabris(client);
    webView = new WebView({url: 'http://wikipedia.com'});
  });

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

});

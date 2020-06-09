import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import PdfView from '../../../src/tabris/widgets/PdfView';
import Blob from '../../../src/tabris/Blob';
import {toXML} from '../../../src/tabris/Console';

describe('PdfView', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {PdfView} */
  let pdfView;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    pdfView = new PdfView();
    tabris.flush();
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates PdfView', function() {
      expect(client.calls({op: 'create'})[0].type).to.deep.equal('tabris.PdfView');
    });

  });

  describe('events', function() {

    let listener;

    function checkListen(event) {
      const listen = client.calls({op: 'listen', id: pdfView.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    }

    beforeEach(function() {
      listener = spy();
      pdfView.zoomEnabled = true;
    });

    it('load on success', function() {
      pdfView.onLoad(listener);

      tabris._notify(pdfView.cid, 'load', {error: false});

      checkListen('load');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: pdfView, error: false});
    });

    it('load on fail', function() {
      pdfView.onLoad(listener);

      tabris._notify(pdfView.cid, 'load', {error: true});

      checkListen('load');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: pdfView, error: true});
    });

  });

  describe('properties', function() {

    beforeEach(function() {
      spy(console, 'warn');
      client.resetCalls();
    });

    describe('src', function() {

      it('defaults to null', function() {
        expect(pdfView.src).to.be.null;
      });

      it('can be set to uri', function() {
        pdfView.src = '/foo.pdf';
        expect(pdfView.src).to.equal('/foo.pdf');
      });

      it('can be set to null', function() {
        pdfView.src = '/foo.pdf';
        pdfView.src = null;
        expect(pdfView.src).to.be.null;
      });

      it('can be set to blob', function() {
        const blob = new Blob([new Int8Array([1, 0, 2]).buffer]);
        pdfView.src = blob;
        expect(pdfView.src).to.equal(blob);
      });

      it('can not be set to other type', function() {
        pdfView.src = 12;

        expect(pdfView.src).to.be.null;
        expect(console.warn).to.have.been.calledOnce;
      });

      it('set to string SETs string', function() {
        pdfView.src = '/foo.pdf';

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.src).to.deep.equal({type: 'uri', uri: '/foo.pdf'});
      });

      it('set to blob SETs arrayBuffer', function() {
        const buffer = new Int8Array([1, 0, 2]).buffer;
        pdfView.src = new Blob([buffer]);

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.src).to.deep.equal({type: 'buffer', buffer});
      });

      it('set to null SETs null', function() {
        pdfView.src = '/foo.pdf';
        client.resetCalls();
        pdfView.src = null;

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.src).to.be.null;
      });

      it('can be set to value in constructor', function() {
        pdfView = new PdfView({src: '/foo.pdf'});
        expect(pdfView.src).to.equal('/foo.pdf');
      });

    });

    describe('zoomEnabled', function() {

      it('defaults to false', function() {
        expect(pdfView.zoomEnabled).to.be.false;
      });

      it('can be set to true', function() {
        pdfView.zoomEnabled = true;
        expect(pdfView.zoomEnabled).to.be.true;
      });

      it('set true SETs true', function() {
        pdfView.zoomEnabled = true;
        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.zoomEnabled).to.be.true;
      });

      it('can be set to true in constructor', function() {
        pdfView = new PdfView({zoomEnabled: true});
        expect(pdfView.zoomEnabled).to.be.true;
      });

    });

    describe('spacing', function() {

      it('defaults to 0', function() {
        expect(pdfView.spacing).to.equal(0);
      });

      it('can be set to positive', function() {
        pdfView.spacing = 10;
        expect(pdfView.spacing).to.equal(10);
      });

      it('can not be set to negative', function() {
        pdfView.spacing = -10;
        expect(pdfView.spacing).to.equal(0);
      });

      it('set to value SETs value', function() {
        pdfView.spacing = 10;

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.spacing).to.equal(10);
      });

      it('can be set to true in constructor', function() {
        pdfView = new PdfView({spacing: 10});
        expect(pdfView.spacing).to.equal(10);
      });

    });

    describe('pageElevation', function() {

      it('defaults to 0', function() {
        expect(pdfView.pageElevation).to.equal(0);
      });

      it('can be set to positive', function() {
        pdfView.pageElevation = 10;
        expect(pdfView.pageElevation).to.equal(10);
      });

      it('can not be set to negative', function() {
        pdfView.pageElevation = -1;
        expect(pdfView.pageElevation).to.equal(0);
      });

      it('is rounded', function() {
        pdfView.pageElevation = 1.5;
        expect(pdfView.pageElevation).to.equal(2);
      });

      it('set value SETs values', function() {
        pdfView.pageElevation = 10;

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.pageElevation).to.equal(10);
      });

      it('can be set to value in constructor', function() {
        pdfView = new PdfView({pageElevation: 10});
        expect(pdfView.pageElevation).to.equal(10);
      });

    });

    describe('pageBackground', function() {

      it('defaults to "initial"', function() {
        expect(pdfView.pageBackground).to.equal('initial');
      });

      it('can be set to color', function() {
        pdfView.pageBackground = 'rgba(1, 2, 3, 0.5)';
        expect(pdfView.pageBackground.toArray()).to.deep.equal([1, 2, 3, 128]);
      });

      it('can be set to null', function() {
        pdfView.pageBackground = 'rgba(1, 2, 3, 0.5)';
        pdfView.pageBackground = null;
        expect(pdfView.pageBackground).to.equal('initial');
      });

      it('set value SETs encoded value', function() {
        pdfView.pageBackground = 'rgba(1, 2, 3, 0.5)';

        const call = client.calls({id: pdfView.cid, op: 'set'})[0];
        expect(call.properties.pageBackground).to.deep.equal([1, 2, 3, 128]);
      });

      it('can be set to value in constructor', function() {
        pdfView = new PdfView({pageBackground: 'rgba(1, 2, 3, 0.5)'});
        expect(pdfView.pageBackground.toArray()).to.deep.equal([1, 2, 3, 128]);
      });

    });

  });

  describe('padding', function() {

    it('is set on Android', function() {
      tabris.device.platform = 'Android';

      pdfView.padding = 16;

      expect(client.calls({op: 'set'})[0].properties.padding).to.deep.equal({
        left: 16, top: 16, right: 16, bottom: 16
      });
    });
    it('is not set on iOS', function() {
      spy(client, 'calls');
      tabris.device.platform = 'iOS';

      pdfView.padding = 16;

      expect(client.calls).to.not.have.been.called;
    });

  });

  describe('toXML', function() {

    beforeEach(function() {
      // @ts-ignore
      stub(client, 'get').returns({});
    });

    it('prints xml element with string src', function() {
      // @ts-ignore
      expect(new PdfView({src: '/foo.pdf'})[toXML]()).to.match(
        /<PdfView .* src='\/foo\.pdf'\/>/
      );
    });

    it('prints xml element with blob src', function() {
      // @ts-ignore
      expect(new PdfView({src: new Blob([])})[toXML]()).to.match(
        /<PdfView .* src='\[object Blob\]'\/>/
      );
    });

    it('prints xml element with null src', function() {
      // @ts-ignore
      expect(new PdfView({})[toXML]()).to.match(
        /<PdfView .* src=''\/>/
      );
    });

  });

});

import {expect, mockTabris, restore, spy} from '../../test';
import ClientMock from '../ClientMock';
import Composite from '../../../src/tabris/widgets/Composite';
import Canvas from '../../../src/tabris/widgets/Canvas';
import Blob from '../../../src/tabris/Blob';
import {getBytes} from '../../../src/tabris/util';

describe('Canvas', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {Canvas} */
  let canvas;

  /** @type {sinon.SinonSpy} */
  let cb;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    canvas = new Canvas();
    tabris.flush();
    cb = spy();
  });

  afterEach(function() {
    canvas.dispose();
    canvas = null;
    restore();
  });

  it('extends Composite', function() {
    expect(canvas).to.be.instanceOf(Canvas);
    expect(canvas).to.be.instanceOf(Composite);
  });

  it('CREATEs Canvas', function() {
    expect(client.calls({type: 'tabris.Canvas'})[0].id).to.equal(canvas.cid);
  });

  describe('toBlob', function() {

    /**
     * @returns {{onSuccess: Function, quality: number, mimeType: string}}
     */
    function getCall() {
      const calls = client.calls({id: canvas.cid, op: 'call', method: 'toBlob'});
      if (calls.length !== 1) {
        throw new Error(`Got ${calls.length} toBlob native calls`);
      }
      // @ts-ignore
      return calls[0].parameters;
    }

    it('throws for missing callback', function() {
      expect(() => canvas.toBlob()).to.throw(TypeError);
    });

    it('throws for invalid callback', function() {
      expect(() => canvas.toBlob(null)).to.throw(TypeError);
    });

    it('it CALLs draw on GC', function() {
      const ctx = canvas.getContext('2d', 100, 100);
      ctx.rect(10, 10, 40, 40);
      canvas.toBlob(cb);

      const gcId = client.calls({op: 'create', type: 'tabris.GC'})[0].id;
      const nativeCalls = client.calls({op: 'call'});
      expect(nativeCalls[0].id).to.equal(gcId);
      expect(nativeCalls[0].method).to.equal('init');
      expect(nativeCalls[1].id).to.equal(gcId);
      expect(nativeCalls[1].method).to.equal('draw');
      expect(nativeCalls[2].id).to.equal(canvas.cid);
      expect(nativeCalls[2].method).to.equal('toBlob');
    });

    it('it CALLs with default parameters', function() {
      canvas.toBlob(cb);

      expect(getCall().mimeType).to.equal('image/png');
      expect(getCall().quality).to.equal(1);
      expect(getCall().onSuccess).to.be.instanceOf(Function);
    });

    it('it CALLs with valid mime types', function() {
      ['image/png', 'image/jpeg', 'image/webp'].forEach(mimeType => {
        client.resetCalls();
        canvas.toBlob(cb, mimeType);
        expect(getCall().mimeType).to.equal(mimeType);
      });
    });

    it('it CALLs with fallback mime type', function() {
      ['image/tiff', 'text/javascript', 'foo', {}, null, 23, []].forEach(mimeType => {
        client.resetCalls();
        canvas.toBlob(cb, mimeType);
        expect(getCall().mimeType).to.equal('image/png');
      });
    });

    it('it CALLs with valid quality', function() {
      [['image/png', 0], ['image/jpeg', 1], ['image/webp', 0.23]].forEach(([mimeType, quality]) => {
        client.resetCalls();
        canvas.toBlob(cb, mimeType, quality);
        expect(getCall().quality).to.equal(quality);
      });
    });

    it('it CALLs with default quality', function() {
      [['image/png', 1], ['image/jpeg', 0.92], ['image/webp', 0.8]].forEach(([mimeType, quality]) => {
        client.resetCalls();
        canvas.toBlob(cb, mimeType);
        expect(getCall().quality).to.equal(quality);
      });
    });

    it('it CALLs with fallback quality', function() {
      [-1, NaN, Infinity, null, false, undefined, {}, []].forEach(quality => {
        client.resetCalls();
        canvas.toBlob(cb, 'image/jpeg', quality);
        expect(getCall().quality).to.equal(0.92);
      });
    });

    it('calls callback with blob', function() {
      canvas.toBlob(cb);
      const buffer = new ArrayBuffer(23);

      getCall().onSuccess(buffer, 'image/jpeg');

      /** @type {Blob} */
      const blob = cb.getCall(0).args[0];
      expect(blob).to.be.instanceOf(Blob);
      expect(blob.size).to.equal(23);
      expect(getBytes(blob)).to.equal(buffer);
      expect(blob.type).to.equal('image/jpeg');
    });

    it('calls callback with null', function() {
      canvas.toBlob(cb);
      getCall().onSuccess(null);
      expect(cb.getCall(0).args[0]).to.be.null;
    });

  });

});

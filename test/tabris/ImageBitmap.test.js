// @ts-ignore
import {expect, mockTabris, restore} from '../test';
import ClientMock from './ClientMock';
import ImageBitmap from '../../src/tabris/ImageBitmap';
import Blob from '../../src/tabris/Blob';
import ImageData from '../../src/tabris/ImageData';
import Canvas from '../../src/tabris/widgets/Canvas';

const createImageBitmap = ImageBitmap.createImageBitmap;

describe('ImageBitmap', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  it('can not be instantiated', function() {
    // @ts-ignore
    expect(() => new ImageBitmap()).to.throw(TypeError, 'Illegal constructor');
  });

  describe('createImageBitmap', function() {

    it('rejects for missing Parameter', function() {
      // @ts-ignore
      return createImageBitmap().then(() => {
        throw new Error('should reject');
      }).catch(ex => {
        expect(ex).to.be.instanceOf(TypeError);
        expect(ex.message).to.equal(
          '0 is not a valid argument count for any overload of createImageBitmap.'
        );
      });
    });

    it('rejects for invalid Parameter', function() {
      // @ts-ignore
      return createImageBitmap(new Date()).then(() => {
        throw new Error('should reject');
      }).catch(ex => {
        expect(ex).to.be.instanceOf(TypeError);
        expect(ex.message).to.equal(
          'Argument 1 of createImageBitmap could not be converted to any of: Blob, ImageData, ImageBitmap, Canvas.'
        );
      });
    });

    it('rejects for too many Parameter', function() {
      return createImageBitmap(new Blob(), {}).then(() => {
        throw new Error('should reject');
      }).catch(ex => {
        expect(ex).to.be.instanceOf(TypeError);
        expect(ex.message).to.equal(
          '2 is not a valid argument count for any overload of createImageBitmap.'
        );
      });
    });

    describe('with Blob', function() {

      /** @type {Promise<ImageBitmap>} */
      let result;

      /** @type {string} */
      let id;

      beforeEach(function() {
        result = createImageBitmap(new Blob([new Uint8Array([1, 2, 3])]));
        id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
      });

      it('returns Promise', function() {
        expect(result).to.be.instanceOf(Promise);
      });

      it('calls CREATE once', function() {
        expect(client.calls({type: 'tabris.ImageBitmap', op: 'create'}).length).to.equal(1);
      });

      describe('on success', function() {

        /** @type {any} */
        let param;

        /** @type {ImageBitmap} */
        let image;

        beforeEach(function() {
          param = client.calls({op: 'call', method: 'loadEncodedImage', id})[0].parameters;
          param.onSuccess({width: 100, height: 200});
          return result.then(value => {
            image = value;
          });
        });

        it('received array buffer ', function() {
          expect(param.image).to.be.instanceOf(ArrayBuffer);
          expect(new Uint8Array(param.image)).to.deep.equal(new Uint8Array([1, 2, 3]));
        });

        it('resolves with ImageBitmap', function() {
          expect(image).to.be.instanceOf(ImageBitmap);
        });

        it('sets dimension', function() {
          expect(image.width).to.equal(100);
          expect(image.height).to.equal(200);
        });

        it('dimension are read-only', function() {
          // @ts-ignore
          image.width = 0;
          // @ts-ignore
          image.height = 0;
          expect(image.width).to.equal(100);
          expect(image.height).to.equal(200);
        });

        describe('and close', function() {

          beforeEach(function() {
            image.close();
          });

          it('DESTROYs native objects', function() {
            expect(client.calls({op: 'destroy', id}).length).to.equal(1);
          });

          it('can not clase again', function() {
            image.close();
            expect(client.calls({op: 'destroy', id}).length).to.equal(1);
          });

        });

      });

      describe('on error', function() {

        /** @type {any} */
        let param;

        /** @type {Error} */
        let error;

        beforeEach(function() {
          param = client.calls({op: 'call', method: 'loadEncodedImage', id})[0].parameters;
          param.onError('foo');
          return result.then(() => {
            throw new Error('should not resolve');
          }).catch(ex => error = ex);
        });

        it('rejects with Error', function() {
          expect(error).to.be.instanceOf(Error);
          expect(error.message).to.equal('foo');
        });

        it('DESTROYs native objects', function() {
          expect(client.calls({op: 'destroy', id}).length).to.equal(1);
        });

      });

    });

    describe('with ImageData', function() {

      /** @type {Promise<ImageBitmap>} */
      let result;

      /** @type {Uint8ClampedArray} */
      let data;

      /** @type {string} */
      let id;

      beforeEach(function() {
        data = new Uint8ClampedArray(60);
        data[0] = 101;
        data[59] = 102;
        result = createImageBitmap(new ImageData(data, 3, 5));
        id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
      });

      it('calls CREATE once', function() {
        expect(client.calls({type: 'tabris.ImageBitmap', op: 'create'}).length).to.equal(1);
      });

      describe('on success', function() {

        /** @type {any} */
        let param;

        /** @type {ImageBitmap} */
        let image;

        beforeEach(function() {
          param = client.calls({op: 'call', method: 'loadImageData', id})[0].parameters;
          param.onSuccess({width: 100, height: 200});
          return result.then(value => {
            image = value;
          });
        });

        it('received typed array and dimension', function() {
          expect(param.image).to.deep.equal(data);
          expect(param.width).to.equal(3);
          expect(param.height).to.equal(5);
        });

        it('resolves with ImageBitmap', function() {
          expect(image).to.be.instanceOf(ImageBitmap);
        });

        it('sets dimension', function() {
          expect(image.width).to.equal(100);
          expect(image.height).to.equal(200);
        });

      });

    });

    describe('with ImageBitmap', function() {

      /** @type {ImageBitmap} */
      let org;

      /** @type {string} */
      let orgId;

      beforeEach(function() {
        const orgPromise = createImageBitmap(new Blob([new Uint8Array([1, 2, 3])]));
        orgId = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
        const param = client.calls({op: 'call', method: 'loadEncodedImage', id: orgId})[0].parameters;
        param.onSuccess({width: 100, height: 200});
        return orgPromise.then(value => {
          org = value;
          client.resetCalls();
        });
      });

      it('fails if original is closed', function() {
        org.close();
        return createImageBitmap(org)
          .catch(ex => {
            expect(ex).to.be.instanceOf(TypeError);
            expect(ex.message).to.equal('Can not create ImageBitmap from another closed ImageBitmap');
          });
      });

      describe('on success', function() {

        /** @type {any} */
        let param;

        /** @type {ImageBitmap} */
        let image;

        /** @type {string} */
        let id;

        beforeEach(function() {
          const result = createImageBitmap(org);
          id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
          param = client.calls({op: 'call', method: 'loadImageBitmap', id})[0].parameters;
          param.onSuccess({width: 300, height: 400});
          return result.then(value => {
            image = value;
          });
        });

        it('received id ', function() {
          expect(param.image).to.equal(orgId);
        });

        it('resolves with ImageBitmap', function() {
          expect(image).to.be.instanceOf(ImageBitmap);
        });

        it('sets dimension', function() {
          expect(image.width).to.equal(300);
          expect(image.height).to.equal(400);
        });

      });

    });

    describe('with Canvas', function() {

      /** @type {Canvas} */
      let canvas;

      beforeEach(function() {
        canvas = new Canvas();
      });

      it('fails if canvas is disposed', function() {
        canvas.dispose();
        return createImageBitmap(canvas)
          .catch(ex => {
            expect(ex).to.be.instanceOf(TypeError);
            expect(ex.message).to.equal('Can not create ImageBitmap from a disposed Canvas');
          });
      });

      describe('on success', function() {

        /** @type {any} */
        let param;

        /** @type {ImageBitmap} */
        let image;

        /** @type {string} */
        let id;

        beforeEach(function() {
          const ctx = canvas.getContext('2d', 100, 100);
          ctx.rect(10, 10, 40, 40);
          const result = createImageBitmap(canvas);
          id = client.calls({type: 'tabris.ImageBitmap', op: 'create'})[0].id;
          param = client.calls({op: 'call', method: 'loadCanvas', id})[0].parameters;
          param.onSuccess({width: 300, height: 400});
          return result.then(value => {
            image = value;
          });
        });

        it('it CALLs draw on GC', function() {
          const gcId = client.calls({op: 'create', type: 'tabris.GC'})[0].id;
          const nativeCalls = client.calls({op: 'call'});
          expect(nativeCalls[0].id).to.equal(gcId);
          expect(nativeCalls[0].method).to.equal('init');
          expect(nativeCalls[1].id).to.equal(gcId);
          expect(nativeCalls[1].method).to.equal('draw');
          expect(nativeCalls[2].id).to.equal(id);
          expect(nativeCalls[2].method).to.equal('loadCanvas');
        });

        it('received id ', function() {
          expect(param.image).to.equal(canvas.cid);
        });

        it('resolves with ImageBitmap', function() {
          expect(image).to.be.instanceOf(ImageBitmap);
        });

        it('sets dimension', function() {
          expect(image.width).to.equal(300);
          expect(image.height).to.equal(400);
        });

      });

    });

  });

});

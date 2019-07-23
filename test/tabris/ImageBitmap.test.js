// @ts-ignore
import {expect, mockTabris, restore} from '../test';
import ClientStub from './ClientStub';
import ImageBitmap from '../../src/tabris/ImageBitmap';
import Blob from '../../src/tabris/Blob';

const createImageBitmap = ImageBitmap.createImageBitmap;

describe('ImageBitmap', function() {

  /** @type {ClientStub} */
  let client;

  beforeEach(() => {
    client = new ClientStub();
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
          'Argument 1 of createImageBitmap could not be converted to any of: Blob.'
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

  });

});

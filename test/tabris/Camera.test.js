import {expect, mockTabris, restore, spy, stub} from '../test';
import Blob from '../../src/tabris/Blob';
import Camera from '../../src/tabris/Camera';
import ClientMock from './ClientMock';
import NativeObject from '../../src/tabris/NativeObject';

describe('Camera', () => {

  /** @type {Camera} */
  let camera;

  /** @type {ClientMock} */
  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    camera = new Camera({cameraId: 'camera1'});
    camera.active = true;
  });

  afterEach(restore);

  it('throws when not instantiated with "cameraId"', () => {
    expect(() => new Camera()).to.throw(Error, 'Camera requires cameraId');
  });

  it('is instanceof NativeObject', () => {
    expect(camera).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof Camera', () => {
    expect(camera.constructor.name).to.equal('Camera');
    expect(camera).to.be.an.instanceOf(Camera);
  });

  describe('create', () => {

    it('creates a native object', () => {
      expect(client.calls({op: 'create', type: 'tabris.Camera'})).to.not.be.empty;
    });

  });

  describe('captureImage', () => {

    it('calls native `captureImage`', () => {
      spy(client, 'call');

      camera.captureImage();

      expect(client.call).to.have.been.calledWithMatch(camera.cid, 'captureImage', {});
      const args = client.call.lastCall.args[2];
      expect(args.onResult).to.be.a('function');
      expect(args.onError).to.be.a('function');
    });

    it('calls native `captureImage` with options', () => {
      spy(client, 'call');

      camera.captureImage({flash: 'off'});

      expect(client.call).to.have.been.calledWithMatch(
        camera.cid,
        'captureImage',
        {options: {flash: 'off'}}
      );
      const args = client.call.lastCall.args[2];
      expect(args.onResult).to.be.a('function');
      expect(args.onError).to.be.a('function');
    });

    it('resolves on successful captureImage', () => {
      const expectedResult = {
        image: new Blob([new ArrayBuffer(3)], {type: 'image/jpg'}),
        width: 100,
        height: 200
      };
      stub(client, 'call').callsFake((id, method, args) => args.onResult(expectedResult));
      return camera.captureImage().then(result => {
        expect(result).to.equal(result);
      });
    });

    it('rejects in case of error', () => {
      stub(client, 'call').callsFake((id, method, args) => args.onError('Could not captureImage'));
      return camera.captureImage().then(() => { throw new Error('Expected to fail'); },
        err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Could not captureImage');
        });
    });

    it('rejects when camera is not active', () => {
      camera.active = false;
      return camera.captureImage().then(() => { throw new Error('Expected to fail'); },
        err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Camera has to be active to capture an image');
        });
    });

  });

  describe('availableCaptureResolutions', () => {

    it('sorts resolutions by megapixel', () => {
      stub(client, 'get').callsFake(() => [
        {width: 1024, height: 768},
        {width: 320, height: 240}
      ]);

      const resolutions = camera.availableCaptureResolutions;

      expect(resolutions).to.deep.equal([
        {width: 320, height: 240},
        {width: 1024, height: 768}
      ]);
    });

  });

  describe('captureResolution', () => {

    it('defaults to balanced', () => {
      expect(camera.priority).to.equal('balanced');
    });

    it('sets valid value', () => {
      camera.priority = 'performance';
      expect(client.properties(camera.cid).priority).to.equal('performance');
    });

  });

});

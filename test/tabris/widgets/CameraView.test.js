import {expect, mockTabris, restore} from '../../test';
import ClientMock from '../ClientMock';
import CameraView from '../../../src/tabris/widgets/CameraView';
import Camera from '../../../src/tabris/Camera';

describe('CameraView', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {CameraView} */
  let widget;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    widget = new CameraView();
    tabris.flush();
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates cameraView', () => {
      expect(client.calls({op: 'create'})[0].type).to.deep.equal('tabris.CameraView');
    });

  });

  describe('instance', function() {

    /** @type {Camera} */
    let camera;

    beforeEach(function() {
      camera = new Camera({cameraId: 'camera1'});
      camera.active = true;
    });

    describe('property camera', function() {

      it('defaults to null', function() {
        expect(widget.camera).to.be.null;
      });

      it('returns camera', function() {
        widget.camera = camera;
        expect(widget.camera).to.equal(camera);
      });

      it('SETs camera', function() {
        widget.camera = camera;

        expect(client.calls({op: 'set', id: widget.cid})[0].properties.camera).to.equal(camera.cid);
      });

      it('is nullable', function() {
        widget.camera = camera;
        widget.camera = null;
        expect(widget.camera).to.be.null;
      });

    });

  });

});

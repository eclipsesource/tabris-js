import {expect, mockTabris, restore} from '../../test';
import ClientMock from '../ClientMock';
import CameraView from '../../../src/tabris/widgets/CameraView';

describe('CameraView', () => {

  let client;

  beforeEach(() => {
    client = new ClientMock();
    mockTabris(client);
    new CameraView();
    tabris.flush();
  });

  afterEach(restore);

  describe('constructor', () => {

    it('creates cameraView', () => {
      expect(client.calls({op: 'create'})[0].type).to.deep.equal('tabris.CameraView');
    });

  });

});

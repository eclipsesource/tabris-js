import {expect, mockTabris, restore, spy, stub} from '../../test';
import ClientMock from '../ClientMock';
import ImageView from '../../../src/tabris/widgets/ImageView';

describe('ImageView', function() {

  let client, imageView;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    imageView = new ImageView({zoomEnabled: true});
    tabris.flush();
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates imageView', function() {
      expect(client.calls({op: 'create'})[0].type).to.deep.equal('tabris.ImageView');
    });

  });

  describe('events', function() {

    let listener;

    function checkListen(event) {
      const listen = client.calls({op: 'listen', id: imageView.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal(event);
      expect(listen[0].listen).to.equal(true);
    }

    beforeEach(function() {
      listener = spy();
      imageView.zoomEnabled = true;
    });

    it('zoom', function() {
      imageView.onZoom(listener);
      imageView.zoomLevel = 2;

      tabris._notify(imageView.cid, 'zoom', {zoomLevel: 3});

      checkListen('zoom');
      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: imageView, zoomLevel: 3});
    });

    it('zoomLevelChanged', function() {
      imageView.onZoomLevelChanged(listener);

      tabris._notify(imageView.cid, 'zoom', {zoomLevel: 3});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: imageView, value: 3});
      checkListen('zoom');
    });

  });

  describe('properties', function() {

    beforeEach(function() {
      client.resetCalls();
    });

    describe('zoomEnabled', function() {

      it('set false resets zoomLevel, minZoomLevel and maxZoomLevel', function() {
        imageView.minZoomLevel = 2;
        imageView.maxZoomLevel = 5;
        imageView.zoomLevel = 3;
        client.resetCalls();

        imageView.zoomEnabled = false;

        expect(imageView.minZoomLevel).to.equal(1.0);
        expect(imageView.maxZoomLevel).to.equal(3.0);
        expect(client.calls({op: 'set', id: imageView.cid})[1].properties.zoomLevel).to.equal(1.0);
      });

      it('set false does not reset zoomLevel, minZoomLevel and maxZoomLevel when already disabled', function() {
        imageView.zoomEnabled = false;
        client.resetCalls();
        imageView.zoomEnabled = false;

        expect(client.calls({op: 'set', id: imageView.cid})).to.be.empty;
      });

    });

    describe('zoomLevel', function() {

      it('set throws error when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        expect(() => {
          imageView.zoomLevel = 1.5;
        }).to.throw('zoomLevel can not be set when zoomEnabled is false');
      });

      it('set throws error when smaller than minZoomValue', function() {
        imageView.minZoomLevel = 2;

        expect(() => {
          imageView.zoomLevel = 1.5;
        }).to.throw('zoomLevel can not be smaller than minZoomLevel');
      });

      it('set throws error when larger than maxZoomValue', function() {
        imageView.maxZoomLevel = 2;

        expect(() => {
          imageView.zoomLevel = 3;
        }).to.throw('zoomLevel can not be larger than maxZoomLevel');
      });

      it('set calls native set operation', function() {
        imageView.zoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2.5);
      });

    });

    describe('minZoomLevel', function() {

      it('set throws error when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        expect(() => {
          imageView.minZoomLevel = 1.5;
        }).to.throw('minZoomLevel can not be set when zoomEnabled is false');
      });

      it('set throws error when larger than maxZoomValue', function() {
        imageView.maxZoomLevel = 2;

        expect(() => {
          imageView.minZoomLevel = 3;
        }).to.throw('minZoomLevel can not be larger than maxZoomLevel');
      });

      it('set sets zoomLevel to minZoomLevel when minZoomLevel larger than zoomLevel', function() {
        stub(client, 'get').returns(2); // return 2 for current zoomLevel

        imageView.minZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2.5);
      });

      it('set calls native set operation', function() {
        imageView.minZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.minZoomLevel).to.equal(2.5);
      });
    });

    describe('maxZoomLevel', function() {

      it('set throws error when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        expect(() => {
          imageView.maxZoomLevel = 4;
        }).to.throw('maxZoomLevel can not be set when zoomEnabled is false');
      });

      it('set throws error when smaller than minZoomValue', function() {
        imageView.minZoomLevel = 2;

        expect(() => {
          imageView.maxZoomLevel = 1.5;
        }).to.throw('maxZoomLevel can not be smaller than minZoomLevel');
      });

      it('set sets zoomLevel to maxZoomLevel when maxZoomLevel smaller than zoomLevel', function() {
        stub(client, 'get').returns(2.5); // return 2.5 for current zoomLevel

        imageView.maxZoomLevel = 2;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2);
      });

      it('set calls native set operation', function() {
        imageView.maxZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.maxZoomLevel).to.equal(2.5);
      });

    });

  });

});

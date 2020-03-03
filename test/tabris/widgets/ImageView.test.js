import {expect, mockTabris, restore, spy} from '../../test';
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
      spy(console, 'warn');
      client.resetCalls();
      client.properties(imageView.cid).zoomLevel = 1;
    });

    describe('zoomEnabled', function() {

      it('false in constructor does not warn', function() {
        new ImageView({zoomEnabled: false});
        expect(console.warn).not.to.have.been.called;
      });

      it('set false resets zoomLevel, minZoomLevel and maxZoomLevel', function() {
        imageView.minZoomLevel = 2;
        imageView.maxZoomLevel = 5;
        imageView.zoomLevel = 3;
        client.resetCalls();

        imageView.zoomEnabled = false;

        expect(imageView.minZoomLevel).to.equal(1.0);
        expect(imageView.maxZoomLevel).to.equal(3.0);
        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(1.0);
      });

      it('set false does not reset zoomLevel, minZoomLevel and maxZoomLevel when already disabled', function() {
        imageView.zoomEnabled = false;
        client.resetCalls();
        imageView.zoomEnabled = false;

        expect(client.calls({op: 'set', id: imageView.cid})).to.be.empty;
      });

    });

    describe('zoomLevel', function() {

      it('set warns when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        imageView.zoomLevel = 1.5;

        expect(imageView.zoomLevel).to.equal(1);
        expect(console.warn).to.have.been.calledWithMatch('zoomLevel can not be set when zoomEnabled is false');
      });

      it('set warns when smaller than minZoomValue', function() {
        imageView.minZoomLevel = 2;

        imageView.zoomLevel = 1.5;

        expect(imageView.zoomLevel).to.equal(2);
        expect(console.warn).to.have.been.calledWithMatch('zoomLevel can not be smaller than minZoomLevel');
      });

      it('set warns when larger than maxZoomValue', function() {
        imageView.maxZoomLevel = 2;

        imageView.zoomLevel = 3;

        expect(imageView.zoomLevel).to.equal(1);
        expect(console.warn).to.have.been.calledWithMatch('zoomLevel can not be larger than maxZoomLevel');
      });

      it('set calls native set operation', function() {
        imageView.zoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2.5);
      });

    });

    describe('minZoomLevel', function() {

      it('set warns when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        imageView.minZoomLevel = 1.5;

        expect(imageView.minZoomLevel).to.equal(1);
        expect(console.warn).to.have.been.calledWithMatch('minZoomLevel can not be set when zoomEnabled is false');
      });

      it('set warns when larger than maxZoomValue', function() {
        imageView.maxZoomLevel = 2;

        imageView.minZoomLevel = 3;

        expect(imageView.minZoomLevel).to.equal(1);
        expect(console.warn).to.have.been.calledWithMatch('minZoomLevel can not be larger than maxZoomLevel');
      });

      it('set sets zoomLevel to minZoomLevel when minZoomLevel larger than zoomLevel', function() {
        client.properties(imageView.cid).zoomLevel = 2;

        imageView.minZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2.5);
      });

      it('set calls native set operation', function() {
        imageView.minZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.minZoomLevel).to.equal(2.5);
      });
    });

    describe('maxZoomLevel', function() {

      it('set warns when zoom is disabled', function() {
        imageView.zoomEnabled = false;

        imageView.maxZoomLevel = 2;

        expect(imageView.maxZoomLevel).to.equal(3);
        expect(console.warn).to.have.been.calledWithMatch('maxZoomLevel can not be set when zoomEnabled is false');
      });

      it('set warns when smaller than minZoomValue', function() {
        imageView.minZoomLevel = 2;

        imageView.maxZoomLevel = 1.5;

        expect(imageView.maxZoomLevel).to.equal(3);
        expect(console.warn).to.have.been.calledWithMatch('maxZoomLevel can not be smaller than minZoomLevel');
      });

      it('set sets zoomLevel to maxZoomLevel when maxZoomLevel smaller than zoomLevel', function() {
        client.properties(imageView.cid).zoomLevel = 2.5;
        imageView.maxZoomLevel = 2;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.zoomLevel).to.equal(2);
      });

      it('set calls native set operation', function() {
        imageView.maxZoomLevel = 2.5;

        expect(client.calls({op: 'set', id: imageView.cid})[0].properties.maxZoomLevel).to.equal(2.5);
      });

    });

    describe('image', function() {

      it('SETs equal images only once', function() {
        imageView.image = 'foo.png';
        tabris.flush();
        client.resetCalls();

        imageView.image = 'foo.png';

        expect(client.calls({op: 'set'}).length).to.equal(0);
      });

    });

    describe('order', function() {

      // These tests need Object.keys keeps the chronological property order
      // to be meaningful, which is supposed to be the case since ES2015

      it('is preserved', function() {
        imageView.zoomEnabled = false;

        imageView.set({
          zoomEnabled: true,
          zoomLevel: 0.7,
          minZoomLevel: 0.5,
          maxZoomLevel: 0.8,
          height: 200
        });

        expect(imageView.zoomEnabled).to.be.true;
        expect(imageView.minZoomLevel).to.equal(0.5);
        expect(imageView.maxZoomLevel).to.equal(0.8);
        expect(imageView.zoomLevel).to.equal(0.7);
        expect(imageView.height).to.equal(200);
      });

      it('is fixed', function() {
        imageView.zoomEnabled = false;

        imageView.set({
          maxZoomLevel: 0.8,
          minZoomLevel: 0.5,
          zoomLevel: 0.7,
          zoomEnabled: true,
          height: 200
        });

        expect(imageView.zoomEnabled).to.be.true;
        expect(imageView.minZoomLevel).to.equal(0.5);
        expect(imageView.maxZoomLevel).to.equal(0.8);
        expect(imageView.zoomLevel).to.equal(0.7);
        expect(imageView.height).to.equal(200);
      });

    });

  });

});

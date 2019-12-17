import {expect, mockTabris, restore, stub} from '../../test';
import ClientMock from '../ClientMock';
import Video from '../../../src/tabris/widgets/Video';
import {toXML} from '../../../src/tabris/Console';

describe('Video', function() {

  let client, video;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    video = new Video();
  });

  afterEach(restore);

  it('is created', function() {
    const calls = client.calls({op: 'create', type: 'tabris.Video'});
    expect(calls.length).to.equal(1);
  });

  it('does not SET read-only properties', function() {
    stub(console, 'warn');
    video.set({
      speed: 2,
      position: 3,
      duration: 4,
      state: 'play'
    });

    const calls = client.calls({op: 'set'});
    expect(calls.length).to.equal(0);
  });

  describe('get', function() {

    it('returns initial default property values', function() {
      expect(video.url).to.equal('');
      expect(video.controlsVisible).to.equal(true);
      expect(video.autoPlay).to.equal(true);
    });

    it('GETs read-only properties', function() {
      stub(client, 'get').returns('native value');

      expect(video.speed).to.equal('native value');
      expect(video.position).to.equal('native value');
      expect(video.duration).to.equal('native value');
      expect(video.state).to.equal('native value');
    });

    it('does not cache read-only properties', function() {
      client.properties(video.cid).speed = 0;
      client.properties(video.cid).position = 0.5;
      client.properties(video.cid).duration = 5000;
      client.properties(video.cid).state = 'pause';
      // eslint-disable-next-line no-unused-vars
      let foo = video.speed;
      foo = video.position;
      foo = video.duration;
      foo = video.state;
      tabris.flush();
      client.properties(video.cid).speed = 1;
      client.properties(video.cid).position = 0.6;
      client.properties(video.cid).duration = 6000;
      client.properties(video.cid).state = 'play';

      expect(video.speed).to.equal(1);
      expect(video.position).to.equal(0.6);
      expect(video.duration).to.equal(6000);
      expect(video.state).to.equal('play');
    });

  });

  describe('stateChanged', function() {

    let listener;

    beforeEach(function() {
      listener = stub();
      video.onStateChanged(listener);
    });

    it('calls native listen for stateChanged', function() {
      const listen = client.calls({op: 'listen', id: video.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal('stateChanged');
      expect(listen[0].listen).to.equal(true);
    });

    it('is fired with parameters', function() {
      tabris._notify(video.cid, 'stateChanged', {state: 'play'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: video, value: 'play'});
    });

  });

  describe('speedChanged', function() {

    let listener;

    beforeEach(function() {
      listener = stub();
      video.onSpeedChanged(listener);
    });

    it('calls native listen for speedChanged', function() {
      const listen = client.calls({op: 'listen', id: video.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal('speedChanged');
      expect(listen[0].listen).to.equal(true);
    });

    it('is fired with parameters', function() {
      tabris._notify(video.cid, 'speedChanged', {speed: 2});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: video, value: 2});
    });

  });

  it('pause() CALLs pause', function() {
    video.pause();

    const call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('pause');
  });

  it('play() CALLs play with speed 1', function() {
    video.play();

    const call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('play');
    expect(call[0].parameters.speed).to.equal(1);
  });

  it('play(speed) CALLs play with given speed', function() {
    video.play(2);

    const call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('play');
    expect(call[0].parameters.speed).to.equal(2);
  });

  it('play with invalid parameter throws', function() {
    expect(function() {
      video.play('foo');
    }).to.throw();
  });

  it('seek CALLs seek', function() {
    video.seek(2000);

    const call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('seek');
    expect(call[0].parameters.position).to.equal(2000);
  });

  it('seek with invalid parameter to throw', function() {
    expect(function() {
      video.seek('foo');
    }).to.throw();
  });

  describe('toXML', function() {

    it('toXML prints xml element with state only', function() {
      stub(client, 'get')
        .withArgs(video.cid, 'state').returns('empty')
        .withArgs(video.cid, 'speed').returns(1)
        .withArgs(video.cid, 'duration').returns(0)
        .withArgs(video.cid, 'position').returns(0)
        .withArgs(video.cid, 'bounds').returns({});

      expect(video[toXML]()).to.match(/<Video .* state='empty'\/>/);
    });

    it('toXML prints xml element with essential non-default value', function() {
      video.url = './foo.mp4';
      stub(client, 'get')
        .withArgs(video.cid, 'state').returns('play')
        .withArgs(video.cid, 'speed').returns(1.1)
        .withArgs(video.cid, 'duration').returns(100)
        .withArgs(video.cid, 'position').returns(0)
        .withArgs(video.cid, 'bounds').returns({});

      expect(video[toXML]()).to.match(
        /<Video .* url='.\/foo.mp4' state='play' speed='1.1' position='0' duration='100'\/>/
      );
    });

  });

});

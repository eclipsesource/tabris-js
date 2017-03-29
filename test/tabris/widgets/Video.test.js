import {expect, mockTabris, restore, stub} from '../../test';
import ClientStub from '../ClientStub';
import Video from '../../../src/tabris/widgets/Video';

describe('Video', function() {

  let client, video;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    video = new Video();
  });

  afterEach(restore);

  it('is created', function() {
    let calls = client.calls({op: 'create', type: 'tabris.Video'});
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

    let calls = client.calls({op: 'set'});
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

  });

  describe('change:state', function() {

    let listener;

    beforeEach(function() {
      listener = stub();
      video.on('change:state', listener);
    });

    it('sends listen for statechange', function() {
      let listen = client.calls({op: 'listen', id: video.cid});
      expect(listen.length).to.equal(1);
      expect(listen[0].event).to.equal('statechange');
      expect(listen[0].listen).to.equal(true);
    });

    it('is fired with parameters', function() {
      tabris._notify(video.cid, 'statechange', {state: 'play'});

      expect(listener).to.have.been.calledOnce;
      expect(listener).to.have.been.calledWithMatch({target: video, value: 'play'});
    });

  });

  it('pause() CALLs pause', function() {
    video.pause();

    let call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('pause');
  });

  it('play() CALLs play with speed 1', function() {
    video.play();

    let call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('play');
    expect(call[0].parameters.speed).to.equal(1);
  });

  it('play(speed) CALLs play with given speed', function() {
    video.play(2);

    let call = client.calls({op: 'call', id: video.cid});
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

    let call = client.calls({op: 'call', id: video.cid});
    expect(call.length).to.equal(1);
    expect(call[0].method).to.equal('seek');
    expect(call[0].parameters.position).to.equal(2000);
  });

  it('seek with invalid parameter to throw', function() {
    expect(function() {
      video.seek('foo');
    }).to.throw();
  });

});

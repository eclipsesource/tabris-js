import {expect, mockTabris, restore, spy, stub} from '../test';
import ClientStub from './ClientStub';
import {animate} from '../../src/tabris/Animation';
import NativeObject from '../../src/tabris/NativeObject';

describe('Animation', function() {

  let widget, client;

  function animationId() {
    return client.calls({op: 'create', type: 'tabris.Animation'}).pop().id;
  }

  function findNativeObject(cid) {
    return tabris._nativeObjectRegistry.find(cid);
  }

  function createOp() {
    return client.calls({op: 'create', type: 'tabris.Animation'}).pop().properties;
  }

  class TestWidget extends NativeObject {
    get _nativeType() { return 'TestWidget'; }
  }

  NativeObject.defineProperties(TestWidget.prototype, {
    foo: 'any',
    opacity: {
      type: 'opacity',
      default: 1
    },
    transform: {
      type: 'transform',
      default() {
        return {
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          translationX: 0,
          translationY: 0,
          translationZ: 0
        };
      }
    }
  });

  beforeEach(function() {
    stub(console, 'warn');
    client = new ClientStub();
    mockTabris(client);
    TestWidget.prototype.animate = animate;
    widget = new TestWidget({});
  });

  afterEach(restore);

  describe('animate', function() {

    it('creates native animation with target', function() {
      widget.animate({}, {});
      expect(createOp().target).to.equal(widget.cid);
    });

    it('disposes Animation object on widget dispose', function() {
      widget.animate({}, {}).catch(() => {});
      const animation = findNativeObject(animationId());

      widget.dispose();

      expect(animation.isDisposed()).to.equal(true);
    });

    it('does not keep references to Animation object after completion', function() {
      widget.animate({}, {});
      const animation = findNativeObject(animationId());
      animation._trigger('completed', {});
      spy(animation, 'dispose');

      widget.dispose();

      expect(animation.dispose).not.to.have.been.called;
    });

    it('sets animated properties on animation', function() {
      widget.animate({opacity: 0.4, transform: {rotation: 0.5}}, {});
      const expected = {
        opacity: 0.4,
        transform: {rotation: 0.5, scaleX: 1, scaleY: 1, translationX: 0, translationY: 0, translationZ: 0}
      };
      expect(createOp().properties).to.eql(expected);
    });

    it('caches animated properties in widget', function() {
      widget.animate({opacity: 0.4, transform: {rotation: 0.5}}, {});
      expect(widget.opacity).to.equal(0.4);
      expect(widget.transform).to.eql({
        rotation: 0.5,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      });
    });

    it('caches only valid properties in widget', function() {
      widget.foo = 1;

      widget.animate({opacity: 0.4, transform: {foo: 0.5}, foo: 2}, {});

      expect(widget.foo).to.equal(1);
      expect(widget.opacity).to.equal(0.4);
      expect(widget.transform).to.eql({
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        translationX: 0,
        translationY: 0,
        translationZ: 0
      });
    });

    it('sets valid options only', function() {
      widget.animate({}, {
        delay: 10, duration: 100, repeat: 1, reverse: true, easing: 'ease-out', foo: 'bar'
      });

      expect(createOp()).to.eql({
        delay: 10,
        duration: 100,
        repeat: 1,
        reverse: true,
        easing: 'ease-out',
        target: widget.cid,
        properties: {}
      });
    });

    it('warns against invalid options', function() {
      widget.animate({}, {foo: 'bar'});

      expect(console.warn).to.have.been.calledWithMatch('TestWidget: Ignored invalid animation option "foo"');
    });

    it('does not warn for valid options', function() {
      widget.animate({}, {delay: 23});

      expect(console.warn).to.not.have.been.called;
    });

    it('warns against invalid properties', function() {
      widget.animate({background: '#00ff00', opacity: 0}, {});

      expect(console.warn).to.have.been.calledWithMatch('TestWidget: Ignored invalid animation property "background"');
      expect(createOp().properties).to.eql({opacity: 0});
    });

    it('warns against invalid property values', function() {
      widget.animate({opacity: 0, transform: {foo: 'bar'}}, {});

      expect(console.warn)
        .to.have.been.calledWithMatch('TestWidget: Ignored invalid animation property value for "transform"');
      expect(createOp().properties).to.eql({opacity: 0});
    });

    it('issues listen call for completed', function() {
      widget.animate({}, {});
      expect(client.calls({
        op: 'listen',
        id: animationId(),
        event: 'completed',
        listen: true
      }).length).to.equal(1);
    });

    it('starts animation', function() {
      widget.animate({}, {});
      expect(client.calls({op: 'call', id: animationId(), method: 'start'}).length).to.equal(1);
    });

    it('disposes animation on completion', function() {
      widget.animate({}, {});
      expect(client.calls({op: 'destroy', id: animationId()}).length).to.equal(0);

      findNativeObject(animationId())._trigger('completed', {});
      expect(client.calls({op: 'destroy', id: animationId()}).length).to.equal(1);
    });

    it('returns unresolved Promise', function(done) {
      const thenCallback = spy();

      widget.animate({}, {}).then(thenCallback);

      setTimeout(function() {
        expect(thenCallback).not.to.have.been.called;
        done();
      }, 100);
    });

    it('returns Promise that resolves on completion', function(done) {
      const thenCallback = spy();
      widget.animate({}, {}).then(thenCallback);

      findNativeObject(animationId())._trigger('completed', {});

      setTimeout(function() {
        expect(thenCallback).to.have.been.called;
        done();
      }, 100);
    });

    it('returns Promise that rejects on widget dispose', function(done) {
      const thenCallback = spy();
      const rejectCallback = spy();
      widget.animate({}, {}).then(thenCallback, rejectCallback);

      widget.dispose();

      setTimeout(function() {
        expect(thenCallback).not.to.have.been.called;
        expect(rejectCallback).to.have.been.called;
        done();
      }, 100);
    });

  });

});

import {expect, spy} from '../test';
import Event, {addDOMEventTargetMethods} from '../../src/tabris/Event';

describe('Event', function() {

  let target;
  let listener;

  beforeEach(function() {
    target = {};
    addDOMEventTargetMethods(target);
    listener = spy();
  });

  describe('Event constructor', function() {

    it('sets default values', function() {
      let event = new Event('type');
      expect(event.NONE).to.equal(0);
      expect(event.CAPTURING_PHASE).to.equal(1);
      expect(event.AT_TARGET).to.equal(2);
      expect(event.BUBBLING_PHASE).to.equal(3);
      expect(event.target).to.equal(null);
      expect(event.currentTarget).to.equal(null);
      expect(event.eventPhase).to.equal(0);
      expect(event.bubbles).to.equal(false);
      expect(event.cancelable).to.equal(false);
      expect(event.defaultPrevented).to.equal(false);
      expect(event.isTrusted).to.equal(false);
      expect(event.stopPropagation).to.be.a('function');
      expect(event.stopImmediatePropagation).to.be.a('function');
      expect(event.preventDefault).to.be.a('function');
    });

    it('sets type from parameter', function() {
      let event = new Event('type');
      expect(event.type).to.equal('type');
    });

    it('sets values from eventInitDict parameter', function() {
      let event = new Event('type', {bubbles: true, cancelable: true});
      expect(event.bubbles).to.equal(true);
      expect(event.cancelable).to.equal(true);
    });

  });

  describe('Event.prototype.initEvent', function() {
    let event = new Event();

    it('sets the type, bubbles, cancelable', function() {
      event.initEvent('foo', true, true);

      expect(event.type).to.equal('foo');
      expect(event.bubbles).to.equal(true);
      expect(event.cancelable).to.equal(true);
    });

  });

  describe('addDOMEventTargetMethods', function() {

    it('adds methods to target', function() {
      expect(target.addEventListener).to.be.a('function');
      expect(target.removeEventListener).to.be.a('function');
      expect(target.dispatchEvent).to.be.a('function');
    });

    it('does not overwrite existing window methods', function() {
      let addEventListener = target.addEventListener;
      let removeEventListener = target.removeEventListener;
      let dispatchEvent = target.dispatchEvent;

      addDOMEventTargetMethods(target);

      expect(target.addEventListener).to.equal(addEventListener);
      expect(target.removeEventListener).to.equal(removeEventListener);
      expect(target.dispatchEvent).to.equal(dispatchEvent);
    });

    describe('when listener is added', function() {

      beforeEach(function() {
        target.addEventListener('foo', listener);
      });

      it('it is notified for Events with same type', function() {
        let event = {type: 'foo'};
        target.dispatchEvent(event);
        expect(listener).to.have.been.calledWith(event);
      });

      it('it is not notified for Events with different type', function() {
        let event = {type: 'bar'};
        target.dispatchEvent(event);
        expect(listener).to.have.not.been.called;
      });

      it('it is notified with Events with listener target', function() {
        let event = {type: 'foo'};
        target.dispatchEvent(event);
        expect(listener).to.have.been.calledWith({type: 'foo', target});
        expect(event.target).to.equal(target);
      });

      describe('and removed', function() {

        beforeEach(function() {
          target.removeEventListener('foo', listener);
        });

        it('it is not notified anymore', function() {
          let event = {type: 'foo'};
          target.dispatchEvent(event);
          expect(listener).to.have.not.been.called;
        });
      });

      describe('and added again', function() {

        beforeEach(function() {
          target.addEventListener('foo', listener);
        });

        it('it is notified only once', function() {
          let event = {type: 'foo'};
          target.dispatchEvent(event);
          expect(listener).to.have.been.calledOnce;
        });

        describe('and removed once', function() {

          beforeEach(function() {
            target.removeEventListener('foo', listener);
          });

          it('it is not notified anymore', function() {
            let event = {type: 'foo'};
            target.dispatchEvent(event);
            expect(listener).to.have.not.been.called;
          });

        });

      });

    });

  });

});

import {expect} from '../test';
import Event from '../../src/tabris/Event';
import ProgressEvent from '../../src/tabris/ProgressEvent';

describe('ProgressEvent', function() {

  describe('event constants', function() {

    const EVENT_CONSTANTS = {NONE: 0, CAPTURING_PHASE: 1, AT_TARGET: 2, BUBBLING_PHASE: 3};

    it('are available on constructor and instance', function() {
      let event = new ProgressEvent('foo');
      for (let name in EVENT_CONSTANTS) {
        expect(ProgressEvent[name]).to.equal(EVENT_CONSTANTS[name]);
        expect(event[name]).to.equal(EVENT_CONSTANTS[name]);
      }
    });

    it('are read-only', function() {
      let event = new ProgressEvent('foo');
      for (let name in EVENT_CONSTANTS) {
        ProgressEvent[name] = 23;
        event[name] = 23;
        expect(ProgressEvent[name]).to.equal(EVENT_CONSTANTS[name]);
        expect(event[name]).to.equal(EVENT_CONSTANTS[name]);
      }
    });

  });

  describe('constructor', function() {

    it('throws for missing parameter', function() {
      expect(() => new ProgressEvent()).to.throw(Error, 'Not enough arguments');
    });

    it('sets type from parameter', function() {
      let event = new ProgressEvent('type');
      expect(event.type).to.equal('type');
    });

    it('passes config to super constructor', function() {
      let event = new ProgressEvent('type', {cancelable: true});
      expect(event.cancelable).to.be.true;
    });

  });

  describe('instance', function() {

    let event;

    beforeEach(function() {
      event = new ProgressEvent('type');
    });

    it('is instance of Event', function() {
      expect(event).to.be.instanceOf(Event);
    });

    describe('standard properties', function() {

      it('are available', function() {
        expect(event.bubbles).to.equal(false);
        expect(event.cancelable).to.equal(false);
        expect(event.target).to.equal(null);
        expect(event.currentTarget).to.equal(null);
        expect(event.defaultPrevented).to.equal(false);
        expect(event.eventPhase).to.equal(0);
        expect(event.isTrusted).to.equal(false);
      });

    });

    describe('additional properties', function() {

      it('have correct defaults', function() {
        expect(event.lengthComputable).to.equal(false);
        expect(event.loaded).to.equal(0);
        expect(event.total).to.equal(0);
      });

      it('are read-only', function() {
        event.lengthComputable = true;
        event.loaded = 23;
        event.total = 42;

        expect(event.lengthComputable).to.equal(false);
        expect(event.loaded).to.equal(0);
        expect(event.total).to.equal(0);
      });

    });

  });

});

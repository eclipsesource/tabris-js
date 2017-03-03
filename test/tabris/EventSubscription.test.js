import {expect, mockTabris, spy, restore} from '../test';
import ClientStub from './ClientStub';
import Composite from '../../src/tabris/widgets/Composite';
import EventSubscription from '../../src/tabris/EventSubscription';

describe('EventSubscription', function() {

  let widget, context, callback, onSpy, client, offSpy, type, instance;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    client.resetCalls();
    widget = new Composite();
    onSpy = spy(widget, 'on');
    offSpy = spy(widget, 'off');
    callback = function() {};
    context = {};
    type = 'foo';
    instance = new EventSubscription(widget, type, callback, context);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates an instance', function() {
      expect(instance).to.be.an.instanceof(EventSubscription);
    });

    it('calls on', function() {
      expect(onSpy).to.have.been.calledOnce;
    });

    it('forwards the parameters to on', function () {
      expect(onSpy).to.have.been.calledWith(type, callback, context);
    });

  });

  describe('instance', function() {

    it('contains properties _target type listener and context', function () {
      expect(instance._target).to.equal(widget);
      expect(instance._type).to.equal(type);
      expect(instance._listener).to.equal(callback);
      expect(instance._context).to.equal(context);
    });

    it('properties are read-only', function() {
      instance._target = {};
      instance._type = 'foo';
      instance._listener = function() {};
      instance._context = {};

      expect(instance._target).to.equal(widget);
      expect(instance._type).to.equal(type);
      expect(instance._listener).to.equal(callback);
      expect(instance._context).to.equal(context);
    });

  });

  describe('cancel', function() {

    beforeEach(function() {
      instance.cancel();
    });

    it('calls off', function() {
      expect(offSpy).to.have.been.calledOnce;
    });

    it('passes its properties to off', function() {
      expect(offSpy).to.have.been.calledWith(type, callback, context);
    });

  });

});

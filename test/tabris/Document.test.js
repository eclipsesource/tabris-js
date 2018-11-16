import {expect, mockTabris, spy, stub, restore} from '../test';
import {addDOMDocument} from '../../src/tabris/Document';
import Event from '../../src/tabris/Event';
import ClientStub from './ClientStub';

describe('Document', function() {

  let target, client;

  beforeEach(function() {
    target = {};
    client = new ClientStub();
    mockTabris(client);
    stub(client, 'loadAndExecute').returns({});
    addDOMDocument(target);
  });

  afterEach(restore);

  it('creates objects document, documentElement and location', function() {
    expect(target.document).to.be.an('object');
    expect(target.document.documentElement).to.be.an('object');
    expect(target.document.location).to.be.an('object');
    expect(target.document.location.href).to.equal('');
    expect(target.location).to.equal(target.document.location);
  });

  it('can create mocked HTML elements', function() {
    ['createElement', 'createDocumentFragment'].forEach((method) => {
      const element = target.document[method]();

      expect(element.setAttribute()).to.be.undefined;
      expect(element.appendChild(23)).to.equal(23);
      expect(element.cloneNode().constructor).to.equal(element.constructor);
      expect(element.lastChild().constructor).to.equal(element.constructor);
    });
  });

  it('has event handling', function() {
    expect(() => {
      target.document.addEventListener('foo', function() {});
      target.document.removeEventListener('bar', function() {});
    }).to.not.throw();
  });

  it('fires DOMContentLoaded on tabris.load', function() {
    expect(target.document.readyState).to.equal('loading');
    const listener = spy();
    target.document.addEventListener('DOMContentLoaded', listener);

    tabris.trigger('start');

    expect(listener).to.have.been.called;
    expect(target.document.readyState).to.equal('complete'); // we skip "interactive"
  });

  it('can create HTML Element events', function() {
    const event = target.document.createEvent('foo');

    expect(event).to.be.an.instanceof(Event);
    expect(event.type).to.equal('foo');
  });

  describe('script element', function() {

    let script1, script2, nonScript;

    beforeEach(function() {
      script1 = target.document.createElement('script');
      script2 = target.document.createElement('script');
      nonScript = target.document.createElement('div');
    });

    it('getElementsByTagName returns scripts added to head', function() {
      target.document.head.appendChild(script1);
      target.document.head.appendChild(script2);
      target.document.head.appendChild(nonScript);

      const result = target.document.getElementsByTagName('script');
      expect(result).to.contain(script1);
      expect(result).to.contain(script2);
      expect(result).not.to.contain(nonScript);
    });

    it('executes script', function() {
      script1.src = 'foo.js';

      // Note: Unlike the browser we do this synchronously. This suffices for compatibility.
      target.document.head.appendChild(script1);

      expect(client.loadAndExecute).to.have.been.calledWith('foo.js', '', '');
    });

    it('does not load non-script element', function() {
      nonScript.src = 'foo.js';

      target.document.head.appendChild(nonScript);

      expect(target.bar).to.be.undefined;
      expect(client.loadAndExecute).to.have.not.been.called;
    });

    it('calls onload after successful load', function() {
      script1.src = 'foo.js';
      script1.onload = spy();
      script1.onerror = spy();

      target.document.head.appendChild(script1);

      expect(script1.onload).to.have.been.called;
      expect(script1.onerror).to.have.not.been.called;
    });

    it('calls onerror when script is not found', function() {
      client.loadAndExecute = stub().returns({loadError: true});
      script1.src = 'foo.js';
      script1.onload = spy();
      script1.onerror = spy();

      target.document.head.appendChild(script1);

      expect(script1.onload).to.have.not.been.called;
      expect(script1.onerror).to.have.been.calledWithMatch({message: 'Could not load foo.js'});
    });

    it('calls onerror when script throws error', function() {
      const error = new Error('bang');
      client.loadAndExecute = stub().throws(error);
      script1.src = 'foo.js';
      script1.onload = spy();
      script1.onerror = spy();
      stub(console, 'error');
      stub(console, 'log');

      target.document.head.appendChild(script1);

      expect(console.error).to.have.been.calledWith('Error loading foo.js:', error);
      expect(console.log).to.have.been.calledWith(error.stack);
      expect(script1.onload).to.have.not.been.called;
      expect(script1.onerror).to.have.been.calledWith(error);
    });

  });

});

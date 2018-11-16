import {expect, mockTabris, restore} from '../test';
import ClientStub from './ClientStub';
import HttpRequest from '../../src/tabris/HttpRequest';

describe('HttpRequest', function() {

  let client, request;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  afterEach(function() {
    restore();
  });

  describe('constructor', function() {

    it('creates native object', function() {
      request = new HttpRequest();

      const call = client.calls({op: 'create', id: request.cid})[0];
      expect(call.type).to.equal('tabris.HttpRequest');
      expect(call.properties).to.deep.equal({});
    });

    it('adds native listeners', function() {
      request = new HttpRequest();

      const calls = client.calls({op: 'listen', id: request.cid});
      expect(calls.map(call => [call.event, call.listen])).to.deep.equal([
        ['stateChanged', true],
        ['downloadProgress', true],
        ['uploadProgress', true],
      ]);
    });

  });

  describe('instance', function() {

    beforeEach(function() {
      request = new HttpRequest();
    });

    describe('send', function() {

      it('calls native function with parameters', function() {
        request.send({foo: 23});

        const call = client.calls({op: 'call', id: request.cid})[0];
        expect(call.method).to.equal('send');
        expect(call.parameters).to.deep.equal({foo: 23});
      });

    });

    describe('abort', function() {

      it('calls native function', function() {
        request.abort();

        const call = client.calls({op: 'call', id: request.cid})[0];
        expect(call.method).to.equal('abort');
        expect(call.parameters).to.deep.equal({});
      });

    });

  });

});

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

      let call = client.calls({op: 'create', id: request.cid})[0];
      expect(call.type).to.equal('tabris.HttpRequest');
      expect(call.properties).to.deep.equal({});
    });

    it('adds native listeners', function() {
      request = new HttpRequest();

      let calls = client.calls({op: 'listen', id: request.cid});
      expect(calls.map(call => [call.event, call.listen])).to.deep.equal([
        ['StateChange', true],
        ['DownloadProgress', true],
        ['UploadProgress', true],
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

        let call = client.calls({op: 'call', id: request.cid})[0];
        expect(call.method).to.equal('send');
        expect(call.parameters).to.deep.equal({foo: 23});
      });

    });

    describe('abort', function() {

      it('calls native function', function() {
        request.abort();

        let call = client.calls({op: 'call', id: request.cid})[0];
        expect(call.method).to.equal('abort');
        expect(call.parameters).to.deep.equal({});
      });

    });

  });

});

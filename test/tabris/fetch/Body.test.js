import {expect, stub, restore} from '../../test';
import Body from '../../../src/tabris/fetch/Body';
import * as TextDecoder from '../../../src/tabris/TextDecoder';

describe('Body', function() {

  describe('instance', function() {

    let body, data;

    beforeEach(function() {
      body = new Body();
      data = new Uint8Array([123, 125]).buffer;
      body._initBody(data);
      stub(TextDecoder, 'decode').returns(Promise.resolve('{}'));
    });

    afterEach(restore);

    describe('text', function() {

      it('returns text', function() {
        return body.text().then(text => {
          expect(text).to.equal('{}');
        });
      });

      it('consumes data', function() {
        return body.text().then(() => body.text()).then(expectFail, err => {
          expect(err.message).to.equal('Already read');
        });
      });

    });

    describe('json', function() {

      it('returns object', function() {
        return body.json().then(object => {
          expect(object).to.deep.equal({});
        });
      });

      it('consumes data', function() {
        return body.json().then(() => body.text()).then(expectFail, err => {
          expect(err.message).to.equal('Already read');
        });
      });

    });

    describe('arrayBuffer', function() {

      it('returns copy of array buffer', function() {
        return body.arrayBuffer().then(buffer => {
          expect(buffer).to.deep.equal(data);
          expect(buffer).to.not.equal(data);
        });
      });

      it('consumes data', function() {
        return body.arrayBuffer().then(() => body.text()).then(expectFail, err => {
          expect(err.message).to.equal('Already read');
        });
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

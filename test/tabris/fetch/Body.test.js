import {expect, stub, restore} from '../../test';
import Body from '../../../src/tabris/fetch/Body';
import TextDecoder from '../../../src/tabris/TextDecoder';
import Blob from '../../../src/tabris/Blob';

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
          expect(buffer).to.instanceOf(ArrayBuffer);
          expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array(data));
          expect(buffer).to.not.equal(data);
        });
      });

      it('returns copy of typed array buffer', function() {
        body = new Body();
        data = new Uint8Array([123, 125]);
        body._initBody(data);
        return body.arrayBuffer().then(buffer => {
          expect(buffer).to.instanceOf(ArrayBuffer);
          expect(new Uint8Array(buffer)).to.deep.equal(data);
          expect(buffer).to.not.equal(data.buffer);
        });
      });

      it('returns copy of Blob array buffer', function() {
        body = new Body();
        data = new Uint8Array([123, 125]);
        body._initBody(new Blob([data]));
        return body.arrayBuffer().then(buffer => {
          expect(buffer).to.instanceOf(ArrayBuffer);
          expect(new Uint8Array(buffer)).to.deep.equal(data);
          expect(buffer).to.not.equal(data.buffer);
        });
      });

      it('consumes data', function() {
        return body.arrayBuffer().then(() => body.text()).then(expectFail, err => {
          expect(err.message).to.equal('Already read');
        });
      });
    });

    describe('blob', function() {

      it('returns copy of array buffer', function() {
        return body.blob()
          .then(blob => blob.arrayBuffer())
          .then(buffer => {
            expect(buffer).to.instanceOf(ArrayBuffer);
            expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array(data));
            expect(buffer).to.not.equal(data);
          });
      });

      it('consumes data', function() {
        return body.blob().then(() => body.text()).then(expectFail, err => {
          expect(err.message).to.equal('Already read');
        });
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

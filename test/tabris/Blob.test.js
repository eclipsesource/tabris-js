import {expect, restore, mockTabris, stub} from '../test';
import ClientStub from './ClientStub';
import Blob from '../../src/tabris/Blob';
import TabrisTextEncoder from '../../src/tabris/TextEncoder';
import TabrisTextDecoder from '../../src/tabris/TextDecoder';
import {TextEncoder, TextDecoder} from 'util';

describe('Blob', function() {

  let client;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    stub(TabrisTextEncoder, 'encodeSync').callsFake((text) =>
      new TextEncoder().encode(text).buffer
    );
    stub(TabrisTextDecoder, 'decode').callsFake((buffer) =>
      Promise.resolve(new TextDecoder().decode(buffer))
    );
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates instance without parameters', function() {
      expect(new Blob()).to.be.instanceOf(Blob);
    });

    it('creates instance from empty array', function() {
      expect(new Blob([])).to.be.instanceOf(Blob);
    });

    it('creates instance from array of chunks', function() {
      expect(new Blob([
        new Blob(),
        new ArrayBuffer(0),
        new Int8Array(0),
        new Uint8Array(0),
        new Uint8ClampedArray(0),
        new Int16Array(0),
        new Uint16Array(0),
        new Int32Array(0),
        new Uint32Array(0),
        new Float32Array(0),
        new Float64Array(0)
      ])).to.be.instanceOf(Blob);
    });

    it('creates instance with empty options', function() {
      expect(new Blob([], {})).to.be.instanceOf(Blob);
    });

    it('creates instance with valid options', function() {
      expect(new Blob([], {type: ''})).to.be.instanceOf(Blob);
    });

    it('throws for incorrect chunks parameter type', function() {
      expect(() => new Blob({})).to
        .throw(TypeError, 'Argument 1 of Blob.constructor can\'t be converted to a sequence.');
      expect(() => new Blob(true)).to
        .throw(TypeError, 'Argument 1 of Blob.constructor can\'t be converted to a sequence.');
    });

    it('throws for incorrect options type', function() {
      expect(() => new Blob([], [])).to
        .throw(TypeError, 'Argument 2 of Blob.constructor can\'t be converted to a dictionary.');
      expect(() => new Blob([], true)).to
        .throw(TypeError, 'Argument 2 of Blob.constructor can\'t be converted to a dictionary.');
    });

  });

  describe('type', function() {

    it('is empty string by default', function() {
      expect(new Blob().type).to.equal('');
      expect(new Blob([], {}).type).to.equal('');
    });

    it('is read-only', function() {
      const blob = new Blob();
      blob.type = 'foo';
      expect(blob.type).to.equal('');
    });

    it('returns type set by options', function() {
      expect(new Blob([], {type: 'foo'}).type).to.equal('foo');
      expect(new Blob([], {type: true}).type).to.equal('true');
    });

  });

  describe('size', function() {

    it('is zero by default', function() {
      expect(new Blob().size).to.equal(0);
    });

    it('is read-only', function() {
      const blob = new Blob();
      blob.size = 23;
      expect(blob.size).to.equal(0);
    });

    it('returns sum size of all chunks', function() {
      expect(new Blob([new ArrayBuffer(3), new ArrayBuffer(3)]).size).to.equal(6);
    });

  });

  describe('arrayBuffer', function() {

    it('returns ArrayBuffer via promise', function() {
      return new Blob().arrayBuffer().then(buffer => {
        expect(buffer).to.be.instanceOf(ArrayBuffer);
      });
    });

    it('returns empty ArrayBuffer by default', function() {
      return new Blob().arrayBuffer().then(buffer => {
        expect(buffer.byteLength).to.equal(0);
      });
    });

    it('returns ArrayBuffer from joined array buffers', function() {
      const blob = new Blob([
        new Int8Array([1, 0, 2]).buffer,
        new Uint8Array([3]),
        new Blob([new Uint8Array([0, 4])])
      ]);
      return blob.arrayBuffer().then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([1, 0, 2, 3, 0, 4]));
      });
    });

    it('returns ArrayBuffer from joined texts', function() {
      const blob = new Blob(['{', '€}']);
      return blob.arrayBuffer().then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([123, 226, 130, 172, 125]));
      });
    });

    it('returns ArrayBuffer from joined stringified objects', function() {
      const blob = new Blob([{toString() { return '{'; }}, {toString() { return '€}'; }}]);
      return blob.arrayBuffer().then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([123, 226, 130, 172, 125]));
      });
    });

    it('returns ArrayBuffer from mixed type parts', function() {
      const blob = new Blob([
        String.fromCharCode(0),
        new Uint8Array([1]),
        {toString() { return String.fromCharCode(2); }},
        new Int8Array([3]).buffer
      ]);
      return blob.arrayBuffer().then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([0, 1, 2, 3]));
      });
    });

    it('returns new ArrayBuffer each time', function() {
      const blob = new Blob([new Int8Array([1, 0, 2])]);
      return Promise.all([blob.arrayBuffer(), blob.arrayBuffer()]).then(copies => {
        expect(copies[0]).to.not.equal(copies[1]);
        expect(new Uint8Array(copies[0])).to.deep.equal(new Uint8Array([1, 0, 2]));
        expect(new Uint8Array(copies[1])).to.deep.equal(new Uint8Array([1, 0, 2]));
      });
    });

    it('does not share data', function() {
      const data = new Int8Array([1, 0, 2]);
      const blob = new Blob([data]);
      data[0] = 23;
      return blob.arrayBuffer().then(buffer => {
        new Uint8Array(buffer)[0] = 34;
        return blob.arrayBuffer();
      }).then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([1, 0, 2]));
      });
    });
  });

  describe('text', function() {

    it('returns empty string by default', function() {
      return new Blob().text().then(str => {
        expect(str).to.be.empty.string;
      });
    });

    it('returns string from joined array buffers', function() {
      const blob = new Blob([new Int8Array([123, 226, 130]).buffer, new Uint8Array([172, 125])]);
      return blob.text().then(str => {
        expect(str).to.equal('{€}');
      });
    });

    it('returns string from joined texts', function() {
      const blob = new Blob(['{', '€}']);
      return blob.text().then(str => {
        expect(str).to.equal('{€}');
      });
    });

    it('returns string from joined stringified objects', function() {
      const blob = new Blob([{toString() { return '{'; }}, {toString() { return '€}'; }}]);
      return blob.text().then(str => {
        expect(str).to.equal('{€}');
      });
    });

    it('returns string from mixed type parts', function() {
      const blob = new Blob([
        '{',
        new Uint8Array([226]),
        new Int8Array([130, 172]).buffer,
        {toString() { return '}'; }},
      ]);
      return blob.text().then(str => {
        expect(str).to.equal('{€}');
      });
    });

  });

  describe('toString', function() {

    it('returns [object Blob]', function() {
      expect(new Blob().toString()).to.equal('[object Blob]');
    });

  });

});

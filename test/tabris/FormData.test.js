import {expect, restore, mockTabris, stub} from '../test';
import ClientMock from './ClientMock';
import FormData, {formDataToBlob} from '../../src/tabris/FormData';
import TabrisTextEncoder from '../../src/tabris/TextEncoder';
import TabrisTextDecoder from '../../src/tabris/TextDecoder';
import {TextEncoder, TextDecoder} from 'util';
import File from '../../src/tabris/File';
import Blob from '../../src/tabris/Blob';

describe('FormData', function() {

  /** @type {ClientMock} */
  let client;

  /** @type {FormData} */
  let formData;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    stub(TabrisTextEncoder, 'encodeSync').callsFake((text) =>
      new TextEncoder().encode(text).buffer
    );
    stub(TabrisTextDecoder, 'decode').callsFake((buffer) =>
      Promise.resolve(new TextDecoder().decode(buffer))
    );
    formData = new FormData();
  });

  afterEach(restore);

  describe('getAll', function() {

    it('throws without parameter', function() {
      expect(() => formData.getAll()).to
        .throw(TypeError, 'FormData.getAll requires at least 1 argument, but only 0 were passed');
    });

    it('returns empty array by default', function() {
      expect(formData.getAll('foo')).to.deep.equal([]);
    });

    it('returns safe copy', function() {
      expect(formData.getAll('foo')).to.not.equal(formData.getAll('foo'));
    });

    it('converts parameters to strings', function() {
      formData.append('1', 'foo');
      expect(formData.getAll(1)).to.deep.equal(['foo']);
    });

  });

  describe('get', function() {

    it('throws without parameter', function() {
      expect(() => formData.get()).to
        .throw(TypeError, 'FormData.get requires at least 1 argument, but only 0 were passed');
    });

    it('returns null by default', function() {
      expect(formData.get('foo')).to.be.null;
    });

    it('returns first value only', function() {
      formData.set('foo', 'bar');
      formData.append('foo', 'baz');
      expect(formData.get('foo')).to.equal('bar');
    });

    it('returns null if deleted', function() {
      formData.set('foo', 'bar');
      formData.delete('foo');
      expect(formData.get('foo')).to.be.null;
    });

    it('converts parameter to string', function() {
      formData.set('1', 'bar');
      expect(formData.get(1)).to.equal('bar');
    });

  });

  describe('has', function() {

    it('throws without parameter', function() {
      expect(() => formData.has()).to
        .throw(TypeError, 'FormData.has requires at least 1 argument, but only 0 were passed');
    });

    it('returns false by default', function() {
      expect(formData.has('foo')).to.be.false;
    });

    it('returns true if set', function() {
      formData.set('foo', 'bar');
      expect(formData.has('foo')).to.be.true;
    });

    it('returns false if deleted', function() {
      formData.set('foo', 'bar');
      formData.delete('foo');
      expect(formData.has('foo')).to.be.false;
    });

  });

  describe('append', function() {

    it('throws with missing parameter', function() {
      expect(() => formData.append('foo')).to
        .throw(TypeError, '1 is not a valid argument count for any overload of FormData.append.');
    });

    it('throws with invalid parameter', function() {
      expect(() => formData.append('foo', 'bar', 'baz')).to
        .throw(TypeError, 'Argument 2 of FormData.append is not an object.');
    });

    it('appends string values', function() {
      formData.append('foo', 'bar');
      formData.append('foo', 'baz');
      formData.append('foo', 'xxx');
      expect(formData.getAll('foo')).to.deep.equal(['bar', 'baz', 'xxx']);
    });

    it('converts parameters to strings', function() {
      formData.append(1, 2);
      formData.append(1, {toString() { return 'baz'; }});
      expect(formData.getAll('1')).to.deep.equal(['2', 'baz']);
    });

    it('keeps File value', function() {
      const file = new File(['foo'], 'bar');
      formData.append('baz', file);
      expect(formData.get('baz')).to.equal(file);
    });

    it('converts Blob to File', function() {
      const blob = new Blob(['foo']);

      formData.append('baz', blob);

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file.name).to.equal('blob');
      return file.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

    it('converts Blob to File with given name', function() {
      const blob = new Blob(['foo']);

      formData.append('baz', blob, 'bar');

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file.name).to.equal('bar');
      return file.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

    it('copies File to apply given name', function() {
      const fileIn = new File(['foo'], 'not-bar');

      formData.append('baz', fileIn, 'bar');

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file).not.to.be.equal(fileIn);
      expect(file.name).to.equal('bar');
      return fileIn.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

  });

  describe('set', function() {

    it('throws with missing parameter', function() {
      expect(() => formData.set('foo')).to
        .throw(TypeError, '1 is not a valid argument count for any overload of FormData.set.');
    });

    it('throws with invalid parameter', function() {
      expect(() => formData.set('foo', 'bar', 'baz')).to
        .throw(TypeError, 'Argument 2 of FormData.set is not an object.');
    });

    it('replaces string values', function() {
      formData.set('foo', 'bar');
      formData.set('foo', 'baz');
      expect(formData.getAll('foo')).to.deep.equal(['baz']);
    });

    it('converts parameters to strings', function() {
      formData.set(1, 2);
      expect(formData.getAll('1')).to.deep.equal(['2']);
    });

    it('keeps File value', function() {
      const file = new File(['foo'], 'bar');
      formData.set('baz', file);
      expect(formData.get('baz')).to.equal(file);
    });

    it('converts Blob to File', function() {
      const blob = new Blob(['foo']);

      formData.set('baz', blob);

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file.name).to.equal('blob');
      return file.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

    it('converts Blob to File with given name', function() {
      const blob = new Blob(['foo']);

      formData.set('baz', blob, 'bar');

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file.name).to.equal('bar');
      return file.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

    it('copies File to apply given name', function() {
      const fileIn = new File(['foo'], 'not-bar');

      formData.set('baz', fileIn, 'bar');

      const file = /** @type {File} */(formData.get('baz'));
      expect(file).to.be.instanceOf(File);
      expect(file).not.to.be.equal(fileIn);
      expect(file.name).to.equal('bar');
      return fileIn.text().then(text => {
        expect(text).to.equal('foo');
      });
    });

  });

  describe('delete', function() {

    it('throws with missing parameter', function() {
      expect(() => formData.delete()).to
        .throw(TypeError, '0 is not a valid argument count for any overload of FormData.delete.');
    });

    it('deletes existing values', function() {
      formData.set('foo', 'bar');
      formData.delete('foo');
      expect(formData.getAll('foo')).to.deep.equal([]);
    });

    it('converts parameters to strings', function() {
      formData.set('1', 'bar');
      formData.delete(1);
      expect(formData.getAll('1')).to.deep.equal([]);
    });

  });

  describe('toString', function() {

    it('returns [object FormData]', function() {
      expect(new FormData().toString()).to.equal('[object FormData]');
    });

  });

  describe('with data', function() {

    /** @type {File} */
    let file;

    beforeEach(function() {
      file = new File(['x'], 'y');
      formData.append('foo', 'bar1');
      formData.append('foo', 'bar2');
      formData.append('foo', 'bar3');
      formData.append('baz', file);
    });

    describe('entries() iterator', function() {

      it('next() iterates through all entries', function() {
        const entries = formData.entries();
        expect(entries.next()).to.deep.equal({done: false, value: ['baz', file]});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar1']});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar2']});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar3']});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
      });

      it('for .... of iterates through all entries', function() {
        const entries = [];
        for (const key of formData.entries()) {
          entries.push(key);
        }
        expect(entries).to.deep.equal([['baz', file], ['foo', 'bar1'], ['foo', 'bar2'], ['foo', 'bar3']]);
      });

      it('skips removed entry', function() {
        const entries = formData.entries();
        expect(entries.next()).to.deep.equal({done: false, value: ['baz', file]});
        formData.delete('foo');
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
      });

      it('skips removed sub-entry', function() {
        const entries = formData.entries();
        expect(entries.next()).to.deep.equal({done: false, value: ['baz', file]});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar1']});
        formData.set('foo', 'bar3');
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
      });

    });

    describe('Symbol.iterator iterator', function() {

      it('next() iterates through all entries', function() {
        const entries = formData[Symbol.iterator]();
        expect(entries.next()).to.deep.equal({done: false, value: ['baz', file]});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar1']});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar2']});
        expect(entries.next()).to.deep.equal({done: false, value: ['foo', 'bar3']});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
        expect(entries.next()).to.deep.equal({done: true, value: undefined});
      });

      it('for .... of iterates through all entries', function() {
        const entries = [];
        for (const key of formData) {
          entries.push(key);
        }
        expect(entries).to.deep.equal([['baz', file], ['foo', 'bar1'], ['foo', 'bar2'], ['foo', 'bar3']]);
      });

    });

    describe('keys() iterator', function() {

      it('next() iterates through all keys with duplicates', function() {
        const keys = formData.keys();
        expect(keys.next()).to.deep.equal({done: false, value: 'baz'});
        expect(keys.next()).to.deep.equal({done: false, value: 'foo'});
        expect(keys.next()).to.deep.equal({done: false, value: 'foo'});
        expect(keys.next()).to.deep.equal({done: false, value: 'foo'});
        expect(keys.next()).to.deep.equal({done: true, value: undefined});
        expect(keys.next()).to.deep.equal({done: true, value: undefined});
      });

      it('for .... of iterates through all keys with duplicates', function() {
        const keys = [];
        for (const key of formData.keys()) {
          keys.push(key);
        }
        expect(keys).to.deep.equal(['baz', 'foo', 'foo', 'foo']);
      });

    });

    describe('values() iterator', function() {

      it('next() iterates through all values', function() {
        const values = formData.values();
        expect(values.next()).to.deep.equal({done: false, value: file});
        expect(values.next()).to.deep.equal({done: false, value: 'bar1'});
        expect(values.next()).to.deep.equal({done: false, value: 'bar2'});
        expect(values.next()).to.deep.equal({done: false, value: 'bar3'});
        expect(values.next()).to.deep.equal({done: true, value: undefined});
        expect(values.next()).to.deep.equal({done: true, value: undefined});
      });

      it('for .... of iterates through all keys with duplicates', function() {
        const values = [];
        for (const value of formData.values()) {
          values.push(value);
        }
        expect(values).to.deep.equal([file, 'bar1', 'bar2', 'bar3']);
      });

    });

    describe('formDataToBlob', function() {

      /** @type {Blob} */
      let blob;

      beforeEach(function() {
        blob = formDataToBlob(formData);
      });

      it('sets type', function() {
        expect(blob.type).to.match(/multipart\/form-data; boundary=----[0-9a-z]+/);
      });

      it('text', function() {
        return blob.text().then(text => {
          const boundary = blob.type.split('boundary=').pop();
          const parts = text.split(boundary);
          expect(parts).to.deep.equal([
            '--',
            '\r\nContent-Disposition: form-data; name="baz"; filename="y"'
              + '\r\nContent-Type: application/octet-stream\r\n\r\nx\r\n--',
            '\r\nContent-Disposition: form-data; name="foo"\r\n\r\nbar1\r\n--',
            '\r\nContent-Disposition: form-data; name="foo"\r\n\r\nbar2\r\n--',
            '\r\nContent-Disposition: form-data; name="foo"\r\n\r\nbar3\r\n--',
            '--'
          ]);
        });
      });

    });

  });

});

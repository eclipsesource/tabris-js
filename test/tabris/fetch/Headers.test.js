import {expect, spy, restore} from '../../test';
import Headers from '../../../src/tabris/fetch/Headers';

describe('Headers', function() {

  afterEach(restore);

  describe('constructor', function() {

    it('succeeds without arguments', function() {
      let headers = new Headers();
      expect(Array.from(headers.entries())).to.deep.equal([]);
    });

    it('accepts object', function() {
      let headers = new Headers({foo: '23', bar: '42'});
      expect(headers.get('foo')).to.equal('23');
      expect(headers.get('bar')).to.equal('42');
    });

    it('accepts array of tuples', function() {
      let headers = new Headers([['foo', '23'], ['bar', '42']]);
      expect(headers.get('foo')).to.equal('23');
      expect(headers.get('bar')).to.equal('42');
    });

    it('accepts Header instance', function() {
      let headers = new Headers(new Headers({foo: 23}));
      expect(headers.get('foo')).to.equal('23');
    });

  });

  describe('instance', function() {

    let headers;

    beforeEach(function() {
      headers = new Headers({foo: '23', bar: '42'});
    });

    describe('has', function() {

      it('returns true if included, false if not', function() {
        expect(headers.has('foo')).to.be.true;
        expect(headers.has('unknown')).to.be.false;
      });

      it('normalizes key', function() {
        headers.set('23', 'foo');
        expect(headers.has(23)).to.be.true;
      });

    });

    describe('get', function() {

      it('returns value if included, null if not', function() {
        expect(headers.get('foo')).to.equal('23');
        expect(headers.get('unknown')).to.be.null;
      });

      it('normalizes key', function() {
        headers.set('23', 'foo');
        expect(headers.get(23)).to.equal('foo');
      });

    });

    describe('set', function() {

      it('replaces previous value', function() {
        headers.set('foo', '24');
        expect(headers.get('foo')).to.equal('24');
        expect(headers.get('bar')).to.equal('42');
      });

      it('normalizes key', function() {
        headers.set(23, 'foo');
        expect(headers.get('23')).to.equal('foo');
      });

      it('normalizes value', function() {
        headers.set('23', 4711);
        expect(headers.get('23')).to.equal('4711');
      });

    });

    describe('append', function() {

      it('appends to existing entry', function() {
        headers.append('foo', '42');
        expect(headers.get('foo')).to.equal('23,42');
      });

      it('adds new entry', function() {
        headers.append('foo', '42');
        expect(headers.get('foo')).to.equal('23,42');
      });

      it('normalizes key and value', function() {
        headers.append(23, 42);
        expect(headers.get('23')).to.equal('42');
      });

    });

    describe('delete', function() {

      it('removes entry', function() {
        headers.delete('foo');
        expect(Array.from(headers.keys())).to.deep.equal(['bar']);
      });

      it('normalizes key', function() {
        headers.append(23, 42);
        headers.delete(23);
        expect(Array.from(headers.keys())).to.deep.equal(['foo', 'bar']);
      });

    });

    describe('forEach', function() {

      it('calls callback on given context', function() {
        let callback = spy();
        let context = {};

        headers.forEach(callback, context);

        expect(callback).to.have.been.calledOn(context);
      });

      it('calls callback with all entries', function() {
        let callback = spy();

        headers.forEach(callback);

        expect(callback.callCount).to.equal(2);
        expect(callback.args[0]).to.deep.equal(['23', 'foo', headers]);
        expect(callback.args[1]).to.deep.equal(['42', 'bar', headers]);
      });

    });

    describe('keys', function() {

      it('returns iterator of keys', function() {
        let keys = headers.keys();
        expect(keys.next).to.be.a('function');
        expect(Array.from(keys)).to.deep.equal(['foo', 'bar']);
      });

    });


    describe('values', function() {

      it('returns iterator of values', function() {
        let values = headers.values();
        expect(values.next).to.be.a('function');
        expect(Array.from(values)).to.deep.equal(['23', '42']);
      });

    });

    describe('entries', function() {

      it('returns iterator of entries', function() {
        let entries = headers.entries();
        expect(entries.next).to.be.a('function');
        expect(Array.from(entries)).to.deep.equal([['foo', '23'], ['bar', '42']]);
      });

    });

  });

});

import {expect, restore, mockTabris} from '../test';
import ClientMock from './ClientMock';
import Blob from '../../src/tabris/Blob';
import File from '../../src/tabris/File';

describe('File', function() {

  /** @type {ClientMock} */
  let client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(restore);

  describe('constructor', function() {

    it('creates instance from parts and name', function() {
      const file = new File([], 'foo');
      expect(file).to.be.instanceOf(File);
      expect(file).to.be.instanceOf(Blob);
    });

    it('creates instance with options object', function() {
      expect(new File([], 'foo', {})).to.be.instanceOf(File);
    });

    it('throws for missing parameters', function() {
      // @ts-ignore
      expect(() => new File()).to
        .throw(TypeError, 'File requires at least 2 arguments, but only 0 were passed.');
      // @ts-ignore
      expect(() => new File([])).to
        .throw(TypeError, 'File requires at least 2 arguments, but only 1 were passed.');
    });

    it('passes on parameter', function() {
      const file = new File([new Uint8Array([1, 2, 3]).buffer], 'foo', {type: 'bar'});
      expect(file.type).to.equal('bar');
      return file.arrayBuffer().then(buffer => {
        expect(new Uint8Array(buffer)).to.deep.equal(new Uint8Array([1, 2, 3]));
      });
    });

  });

  describe('name', function() {

    it('is read-only', function() {
      const file = new File([], 'foo');
      // @ts-ignore
      file.name = 'bar';
      expect(file.name).to.equal('foo');
    });

  });

  describe('name', function() {

    it('is read-only', function() {
      const file = new File([], 'foo');
      // @ts-ignore
      file.name = 'bar';
      expect(file.name).to.equal('foo');
    });

    it('converts to string', function() {
      // @ts-ignore
      expect(new File([], true).name).to.equal('true');
    });

  });

  describe('lastModified', function() {

    it('is read-only', function() {
      const file = new File([], 'foo');
      const lastModified = file.lastModified;
      // @ts-ignore
      file.name = 1;
      expect(file.lastModified).to.equal(lastModified);
    });

    it('defaults to creation time', function() {
      const now = Date.now();
      const file = new File([], 'foo');
      expect(file.lastModified).to.be.below(now + 60);
      expect(file.lastModified).to.be.above(now - 60);
    });

    it('converts to valid number', function() {
      expect(new File([], 'foo', {lastModified: 10}).lastModified)
        .to.equal(10);
      expect(new File([], 'foo', {lastModified: -10}).lastModified)
        .to.equal(-10);
      expect(new File([], 'foo', {lastModified: 10.4}).lastModified)
        .to.equal(10);
      expect(new File([], 'foo', {lastModified: '10'}).lastModified)
        .to.equal(10);
      expect(new File([], 'foo', {lastModified: '-10'}).lastModified)
        .to.equal(-10);
      expect(new File([], 'foo', {lastModified: true}).lastModified)
        .to.equal(1);
      expect(new File([], 'foo', {lastModified: NaN}).lastModified)
        .to.equal(0);
      expect(new File([], 'foo', {lastModified: Infinity}).lastModified)
        .to.equal(0);
    });

  });

  describe('toString', function() {

    it('returns [object File]', function() {
      expect(new File([], '').toString()).to.equal('[object File]');
    });

  });

});

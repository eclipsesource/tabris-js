import {expect} from '../test';
import PromisePolyfill from '../../src/tabris/Promise';
import {format} from '../../src/tabris/Formatter';

describe('format', function() {

  let originalPromise;

  before(function() {
    originalPromise = global.Promise;
    global.Promise = PromisePolyfill;
  });

  after(function() {
    global.Promise = originalPromise;
  });

  it('succeeds without arguments', function() {
    let result = format();
    expect(result).to.equal('');
  });

  it('concatenates multiple arguments', function() {
    let result = format('foo', 23);
    expect(result).to.equal('foo 23');
  });

  it('replaces placeholders with arguments', function() {
    let result = format('foo %d %i %f %s %j %%', 23, 42, 3.14, 'foo', {});
    expect(result).to.equal('foo 23 42 3.14 foo {} %');
  });

  it('replaces percent sign', function() {
    let result = format('%d%%', 23);
    expect(result).to.equal('23%');
  });

  it('does not replace unmatched placeholders', function() {
    let result = format('%d %d', 23);
    expect(result).to.equal('23 %d');
  });

  it('does not replace invalid placeholders', function() {
    let result = format('foo %w', 23);
    expect(result).to.equal('foo %w 23');
  });

  it('formats objects', function() {
    let result = format({foo: 23, bar: 42, baz: 4711});
    expect(result).to.equal('{ foo: 23, bar: 42, baz: 4711 }');
  });

  it('formats empty objects', function() {
    let result = format({});
    expect(result).to.equal('{}');
  });

  it('formats arrays', function() {
    let result = format(['foo', 23, null, false]);
    expect(result).to.equal('[ \'foo\', 23, null, false ]');
  });

  it('formats empty arrays', function() {
    let result = format([]);
    expect(result).to.equal('[]');
  });

  it('formats nested objects', function() {
    let result = format({foo: 23, bar: {baz: 42}});
    expect(result).to.equal('{ foo: 23, bar: { baz: 42 } }');
  });

  it('formats nested arrays', function() {
    let result = format(['foo', [23, ['bar', 42]]]);
    expect(result).to.equal('[ \'foo\', [ 23, [ \'bar\', 42 ] ] ]');
  });

  it('formats mixed objects and arrays', function() {
    let result = format({foo: 23, bar: [47, 11]});
    expect(result).to.equal('{ foo: 23, bar: [ 47, 11 ] }');
  });

  it('shortens long arrays', function() {
    let result = format([1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2]);
    expect(result).to.equal('[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, ... 2 more items ]');
  });

  it('detects circular objects', function() {
    let circular  = {foo: 23};
    circular.bar = circular;
    let result = format(circular);
    expect(result).to.equal('{ foo: 23, bar: [Circular] }');
  });

  it('detects circular arrays', function() {
    let circular  = [23];
    circular.push(circular);
    let result = format(circular);
    expect(result).to.equal('[ 23, [Circular] ]');
  });

  it('formats dates', function() {
    let result = format(new Date(23));
    expect(result).to.equal('1970-01-01T00:00:00.023Z');
  });

  it('formats invalid dates', function() {
    let result = format(new Date('invalid'));
    expect(result).to.equal('Invalid Date');
  });

  it('formats errors', function() {
    let result = format(new TypeError('message'));
    expect(result).to.match(/TypeError: message\n\s+at/);
  });

  it('formats typed arrays', function() {
    let result = format(new Uint8Array([1, 2, 3]));
    expect(result).to.equal('Uint8Array [ 1, 2, 3 ]');
  });

  it('formats array buffers', function() {
    let result = format(new Uint8Array([1, 2, 3]).buffer);
    expect(result).to.equal('ArrayBuffer { byteLength: 3 }');
  });

  it('formats pending promises', function() {
    let result = format(new Promise(() => {}));
    expect(result).to.equal('Promise { <pending> }');
  });

  it('formats rejected promises', function() {
    let result = format(Promise.reject('error'));
    expect(result).to.equal('Promise { <rejected> \'error\' }');
  });

  it('formats resolved promises', function() {
    let result = format(Promise.resolve(23));
    expect(result).to.equal('Promise { 23 }');
  });

});

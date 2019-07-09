import {expect, mockTabris, spy, stub, restore, match} from '../test';
import ClientMock from './ClientMock';
import FileSystem, {create as createFileSystem, createError} from '../../src/tabris/FileSystem';
import TextEncoder from '../../src/tabris/TextEncoder';
import TextDecoder from '../../src/tabris/TextDecoder';
import Blob from '../../src/tabris/Blob';

const text = 'Lorem ipsum';

describe('FileSystem', function() {

  let fs, client, data;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    data = new Uint8Array([0, 1, 2, 3, 127, 128, 255]).buffer;
  });

  afterEach(restore);

  it('cannot be instantiated', function() {
    expect(() => new FileSystem()).to.throw(Error, 'FileSystem can not be created');
  });

  describe('create', function() {

    it('creates a native object', function() {
      createFileSystem();
      expect(client.calls({op: 'create', type: 'tabris.FileSystem'})).to.not.be.empty;
    });

  });

  describe('instance', function() {

    beforeEach(function() {
      fs = createFileSystem();
    });

    ['cacheDir', 'filesDir'].forEach(prop => describe(prop, function() {

      it('gets native property', function() {
        stub(client, 'get').callsFake(() => '/path');
        expect(fs[prop]).to.equal('/path');
      });

      it('does not set native property', function() {
        spy(client, 'set');
        fs[prop] = '/other';
        expect(client.set).to.not.have.been.called;
      });

      it('can not be modified', function() {
        stub(client, 'get').callsFake(() => '/path');
        fs[prop] = '/other';
        expect(fs[prop]).to.equal('/path');
      });

    }));

    it('has no listener registration functions for static properties', function() {
      expect(fs.onCacheDirChanged).to.be.undefined;
      expect(fs.onFilesDirChanged).to.be.undefined;
    });

    describe('readFile', function() {

      it('rejects if parameter missing', function() {
        return fs.readFile().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to readFile');
        });
      });

      it('rejects invalid path', function() {
        return fs.readFile('/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('"/../bar" is not a valid file name. Path must not start with ".."');
        });
      });

      it('rejects invalid encoding', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(data));
        return fs.readFile('/foo', 'foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Unsupported encoding: "foo"');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.readFile('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'readFile', {path: '/foo'});
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('ENOENT'));
        return fs.readFile('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No such file or directory: /foo');
        });
      });

      it('resolves with data', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(data));
        return fs.readFile('/foo').then(result => {
          expect(result).to.equal(data);
        });
      });

      it('decodes data with given encoding', function() {
        stub(TextDecoder, 'decode').returns(Promise.resolve(text));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(data));
        return fs.readFile('/foo', 'ascii').then(() => {
          expect(TextDecoder.decode).to.have.been.calledWith(data, 'ascii');
        });
      });

      it('resolves with decoded data', function() {
        stub(TextDecoder, 'decode').returns(Promise.resolve(text));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(data));
        return fs.readFile('/foo', 'utf-8').then(result => {
          expect(result).to.equal(text);
        });
      });

    });

    describe('readDir', function() {

      it('rejects if parameter missing', function() {
        return fs.readDir().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to readDir');
        });
      });

      it('rejects invalid path', function() {
        return fs.readDir('/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(
            '"/../bar" is not a valid file name. Path must not start with ".."'
          );
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.readDir('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'readDir', {path: '/foo'});
      });

      it('resolves on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(['foo', 'bar']));
        return fs.readDir('/foo').then(result => {
          expect(result).to.deep.equal(['foo', 'bar']);
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('ENOTDIR'));
        return fs.readDir('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not a directory: /foo');
        });
      });

    });

    describe('writeFile', function() {

      it('rejects if parameter missing', function() {
        return fs.writeFile('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to writeFile');
        });
      });

      it('rejects invalid path', function() {
        return fs.writeFile('/../bar', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('"/../bar" is not a valid file name. Path must not start with ".."');
        });
      });

      it('rejects invalid data', function() {
        return fs.writeFile('/foo', new Date()).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Date is not an ArrayBuffer');
        });
      });

      it('rejects invalid encoding', function() {
        return fs.writeFile('/foo', 'string', 'foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Unsupported encoding: "foo"');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.writeFile('/foo', data);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'writeFile', {
          path: '/foo',
          data: match.same(data)
        });
      });

      it('converts typed array to arrayBuffer', function() {
        spy(client, 'call');
        const arr = new Uint8Array(data);
        fs.writeFile('/foo', arr);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'writeFile', {
          path: '/foo',
          data: match.same(data)
        });
      });

      it('converts blob to arrayBuffer', function() {
        spy(client, 'call');
        fs.writeFile('/foo', new Blob([data]));
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'writeFile', {
          path: '/foo',
          data: match.has('byteLength', data.byteLength)
        });
      });

      it('encodes text with given encoding', function() {
        stub(TextEncoder, 'encode').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.writeFile('/foo', text, 'ascii').then(() => {
          expect(TextEncoder.encode).to.have.been.calledWith(text, 'ascii');
        });
      });

      it('encodes text with utf-8 by default', function() {
        stub(TextEncoder, 'encode').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.writeFile('/foo', text).then(() => {
          expect(TextEncoder.encode).to.have.been.calledWith(text, 'utf-8');
        });
      });

      it('calls native method with encoded text', function() {
        stub(TextEncoder, 'encode').withArgs(text, 'utf-8').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.writeFile('/foo', text, 'utf-8').then(() => {
          expect(client.call).to.have.been.calledWithMatch(fs.cid, 'writeFile', {path: '/foo', data});
          expect(client.call.args[0][2].data).to.deep.equal(data);
        });
      });

      it('resolves on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.writeFile('/foo', data).then(result => {
          expect(result).to.be.undefined;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('ENOENT'));
        return fs.writeFile('/foo', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No such file or directory: /foo');
        });
      });

    });

    describe('removeFile', function() {

      it('rejects if parameter missing', function() {
        return fs.removeFile().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to removeFile');
        });
      });

      it('rejects invalid path', function() {
        return fs.removeFile('/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(
            '"/../bar" is not a valid file name. Path must not start with ".."'
          );
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.removeFile('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'removeFile', {path: '/foo'});
      });

      it('resolves on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.removeFile('/foo').then(result => {
          expect(result).to.be.undefined;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('ENOENT'));
        return fs.removeFile('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No such file or directory: /foo');
        });
      });

    });

    it('can not be disposed', function() {
      expect(() => {
        fs.dispose();
      }).to.throw(Error, 'Cannot dispose fs object');
    });

  });

  describe('create', function() {

    it('creates an instance', function() {
      expect(createFileSystem()).to.be.instanceOf(FileSystem);
    });

  });

  describe('createError', function() {

    it('returns instance of Error', function() {
      expect(createError({})).to.be.instanceOf(Error);
    });

    it('includes path and code', function() {
      const error = createError('ENOENT', '/foo');
      expect(error.path).to.equal('/foo');
      expect(error.code).to.equal('ENOENT');
    });

    it('includes message in toString()', function() {
      const error = createError('ENOENT', '/foo');
      expect(error.toString()).to.match(/^Error: No such file or directory: \/foo/);
    });

    it('adds message for common error codes', function() {
      expect(createError('EACCES', '/foo').message).to.equal('Permission denied: /foo');
      expect(createError('EEXIST', '/foo').message).to.equal('File exists: /foo');
      expect(createError('ENOENT', '/foo').message).to.equal('No such file or directory: /foo');
      expect(createError('EISDIR', '/foo').message).to.equal('Is a directory: /foo');
      expect(createError('ENOTDIR', '/foo').message).to.equal('Not a directory: /foo');
      expect(createError('ENOTEMPTY', '/foo').message).to.equal('Directory not empty: /foo');
    });

    it('includes message for unknown error codes', function() {
      expect(createError('Drastic failure', '/foo').message)
        .to.equal('Drastic failure: /foo');
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

import {expect, mockTabris, spy, stub} from '../test';
import ClientStub from './ClientStub';
import FileSystem, {create as createFileSystem, createError, normalizePath} from '../../src/tabris/FileSystem';

describe('FileSystem', function() {

  let fs, client, data;

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
    data = new Uint8Array([0, 1, 2, 3, 127, 128, 255]).buffer;
  });

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
        stub(client, 'get', () => '/path');
        expect(fs[prop]).to.equal('/path');
      });

      it('does not set native property', function() {
        spy(client, 'set');
        fs[prop] = '/other';
        expect(client.set).to.not.have.been.called;
      });

      it('can not be modified', function() {
        stub(client, 'get', () => '/path');
        fs[prop] = '/other';
        expect(fs[prop]).to.equal('/path');
      });

    }));

    describe('readFile', function() {

      it('rejects if parameter missing', function() {
        return fs.readFile().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to readFile');
        });
      });

      it('rejects invalid path', function() {
        return fs.readFile('/foo/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal("Path must not contain '..'");
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.readFile('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'readFile', {path: '/foo'});
      });

      it('rejects in case of error', function() {
        stub(client, 'call', (id, method, args) => args.onError('ENOENT'));
        return fs.readFile('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No such file or directory: /foo');
        });
      });

      it('resolves with data', function() {
        stub(client, 'call', (id, method, args) => args.onSuccess(data));
        return fs.readFile('/foo').then(result => {
          expect(result).to.equal(data);
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
        return fs.writeFile('/foo/../bar', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal("Path must not contain '..'");
        });
      });

      it('rejects invalid data', function() {
        return fs.writeFile('/foo', new Date()).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Invalid buffer type');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.writeFile('/foo', data);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'writeFile', {path: '/foo'});
      });

      it('resolves on success', function() {
        stub(client, 'call', (id, method, args) => args.onSuccess());
        return fs.writeFile('/foo', data).then(result => {
          expect(result).to.be.undefined;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call', (id, method, args) => args.onError('ENOENT'));
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
        return fs.removeFile('/foo/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal("Path must not contain '..'");
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.removeFile('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'removeFile', {path: '/foo'});
      });

      it('resolves on success', function() {
        stub(client, 'call', (id, method, args) => args.onSuccess());
        return fs.removeFile('/foo').then(result => {
          expect(result).to.be.undefined;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call', (id, method, args) => args.onError('ENOENT'));
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
      let error = createError('ENOENT', '/foo');
      expect(error.path).to.equal('/foo');
      expect(error.code).to.equal('ENOENT');
    });

    it('includes message in toString()', function() {
      let error = createError('ENOENT', '/foo');
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

  describe('normalizePath', function() {

    it('fails if path is not a string', function() {
      expect(() => normalizePath(23)).to.throw(Error, 'Path must be a string');
    });

    it('fails if path is not absolute', function() {
      expect(() => normalizePath('foo/bar')).to.throw(Error, 'Path must be absolute');
    });

    it('fails if path contains ..', function() {
      expect(() => normalizePath('/foo/../bar')).to.throw(Error, "Path must not contain '..'");
    });

    it('eliminates redundant slashes and dots', function() {
      expect(normalizePath('//foo///././bar/')).to.equal('/foo/bar');
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}

import {expect, match, mockTabris, restore, spy, stub} from '../test';
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

    ['externalCacheDirs', 'externalFileDirs'].forEach(prop => describe(prop, function() {

      it('gets native property', function() {
        stub(client, 'get').callsFake(() => ['/path']);
        expect(fs[prop]).to.deep.equal(['/path']);
      });

      it('does not set native property', function() {
        spy(client, 'set');
        fs[prop] = ['/other'];
        expect(client.set).to.not.have.been.called;
      });

      it('can not be modified', function() {
        stub(client, 'get').callsFake(() => ['/path']);
        fs[prop] = ['/other'];
        expect(fs[prop]).to.deep.equal(['/path']);
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
            '"/../bar" is not a valid directory. Path must not start with ".."'
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

    describe('isFile', function() {

      it('throws if parameter missing', function() {
        expect(() => fs.isFile()).to.throw(Error, 'Not enough arguments to isFile');
      });

      it('throws for invalid path', function() {
        expect(() => fs.isFile('/../bar')).to.throw(
          Error,
          '"/../bar" is not a valid file name. Path must not start with ".."'
        );
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.isFile('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'isFile', {path: '/foo'});
      });

      it('returns true', function() {
        stub(client, 'call').returns(true);
        expect(fs.isFile('/foo')).to.be.true;
      });

      it('returns false', function() {
        stub(client, 'call').returns(false);
        expect(fs.isFile('/foo')).to.be.false;
      });

    });

    describe('isDir', function() {

      it('throws if parameter missing', function() {
        expect(() => fs.isDir()).to.throw(Error, 'Not enough arguments to isDir');
      });

      it('throws for invalid path', function() {
        expect(() => fs.isDir('/../bar')).to.throw(
          Error,
          '"/../bar" is not a valid directory. Path must not start with ".."'
        );
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.isDir('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'isDir', {path: '/foo'});
      });

      it('returns true', function() {
        stub(client, 'call').returns(true);
        expect(fs.isDir('/foo')).to.be.true;
      });

      it('returns false', function() {
        stub(client, 'call').returns(false);
        expect(fs.isDir('/foo')).to.be.false;
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

    describe('appendToFile', function() {

      it('rejects if parameter missing', function() {
        return fs.appendToFile('/foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to appendToFile');
        });
      });

      it('rejects invalid path', function() {
        return fs.appendToFile('/../bar', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('"/../bar" is not a valid file name. Path must not start with ".."');
        });
      });

      it('rejects invalid data', function() {
        return fs.appendToFile('/foo', new Date()).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Date is not an ArrayBuffer');
        });
      });

      it('rejects invalid encoding', function() {
        return fs.appendToFile('/foo', 'string', 'foo').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Unsupported encoding: "foo"');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.appendToFile('/foo', data);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'appendToFile', {
          path: '/foo',
          data: match.same(data)
        });
      });

      it('converts typed array to arrayBuffer', function() {
        spy(client, 'call');
        const arr = new Uint8Array(data);
        fs.appendToFile('/foo', arr);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'appendToFile', {
          path: '/foo',
          data: match.same(data)
        });
      });

      it('converts blob to arrayBuffer', function() {
        spy(client, 'call');
        fs.appendToFile('/foo', new Blob([data]));
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'appendToFile', {
          path: '/foo',
          data: match.has('byteLength', data.byteLength)
        });
      });

      it('encodes text with given encoding', function() {
        stub(TextEncoder, 'encode').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.appendToFile('/foo', text, 'ascii').then(() => {
          expect(TextEncoder.encode).to.have.been.calledWith(text, 'ascii');
        });
      });

      it('encodes text with utf-8 by default', function() {
        stub(TextEncoder, 'encode').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.appendToFile('/foo', text).then(() => {
          expect(TextEncoder.encode).to.have.been.calledWith(text, 'utf-8');
        });
      });

      it('calls native method with encoded text', function() {
        stub(TextEncoder, 'encode').withArgs(text, 'utf-8').returns(Promise.resolve(data));
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.appendToFile('/foo', text, 'utf-8').then(() => {
          expect(client.call).to.have.been.calledWithMatch(fs.cid, 'appendToFile', {path: '/foo', data});
          expect(client.call.args[0][2].data).to.deep.equal(data);
        });
      });

      it('resolves true on file created', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(true));
        return fs.appendToFile('/foo', data).then(result => {
          expect(result).to.be.true;
        });
      });

      it('resolves false on file appended', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(false));
        return fs.appendToFile('/foo', data).then(result => {
          expect(result).to.be.false;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('ENOENT'));
        return fs.appendToFile('/foo', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No such file or directory: /foo');
        });
      });

    });

    describe('createDir', function() {

      it('rejects if parameter missing', function() {
        return fs.createDir().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to createDir');
        });
      });

      it('rejects invalid path', function() {
        return fs.createDir('/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('"/../bar" is not a valid directory. Path must not start with ".."');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.createDir('/foo', data);
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'createDir', {
          path: '/foo'
        });
      });

      it('resolves on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.createDir('/foo').then(result => {
          expect(result).to.be.undefined;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('EACCES'));
        return fs.createDir('/foo', data).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Permission denied: /foo');
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

    describe('remove', function() {

      it('rejects if parameter missing', function() {
        return fs.remove().then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Not enough arguments to remove');
        });
      });

      it('rejects invalid path', function() {
        return fs.remove('/../bar').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(
            '"/../bar" is not a valid file or directory. Path must not start with ".."'
          );
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.remove('/foo');
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'remove', {path: '/foo'});
      });

      it('resolves with true on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(true));
        return fs.remove('/foo').then(result => {
          expect(result).to.be.true;
        });
      });

      it('resolve with false if nothing existed', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess(false));
        return fs.remove('/foo').then(result => {
          expect(result).to.be.false;
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('EACCES'));
        return fs.remove('/foo').then(expectFail, err => {
          expect(err.message).to.equal('Permission denied: /foo');
        });
      });

    });

    describe('openFile', function() {

      it('rejects if options are not an object', function() {
        return fs.openFile('options').then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Options need to be an Object');
        });
      });

      it('rejects if type is not a string', function() {
        return fs.openFile({type: 1}).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Invalid type: 1 is not a string');
        });
      });

      it('rejects if quantity is not a string', function() {
        return fs.openFile({quantity: 2}).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Invalid quantity: 2 is not a string');
        });
      });

      it('rejects if quantity is not a valid string', function() {
        return fs.openFile({quantity: 'many'}).then(expectFail, err => {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Quantity has to be "single" or "multiple" but is "many"');
        });
      });

      it('calls native method', function() {
        spy(client, 'call');
        fs.openFile();
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'openFile', {});
      });

      it('calls native method with options', function() {
        spy(client, 'call');
        fs.openFile({type: 'image/png', quantity: 'multiple'});
        expect(client.call).to.have.been.calledWithMatch(fs.cid, 'openFile', {
          options: {type: 'image/png', quantity: 'multiple'}
        });
      });

      it('resolves with empty array on success when no file selected', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
        return fs.openFile().then(result => {
          expect(result).to.deep.equal([]);
        });
      });

      it('resolves with files array on success', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onSuccess([{
          data,
          name: 'person.png',
          type: 'image/png',
          lastModified: 1234
        }]));
        return fs.openFile().then(result => {
          const file = result[0];
          expect(file.length).to.equal(data.length);
          expect(file.name).to.equal('person.png');
          expect(file.type).to.equal('image/png');
          expect(file.lastModified).to.equal(1234);
        });
      });

      it('rejects in case of error', function() {
        stub(client, 'call').callsFake((id, method, args) => args.onError('Error message'));
        return fs.openFile().then(expectFail, err => {
          expect(err.message).to.equal('Error message');
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
      // @ts-ignore
      expect(error.path).to.equal('/foo');
      // @ts-ignore
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

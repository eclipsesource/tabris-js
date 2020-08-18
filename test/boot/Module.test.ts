import Module, {ModuleLoader} from '../../src/boot/Module';
import * as chai from 'chai';
import {expect} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);
const sandbox = sinon.sandbox.create();
const restore = sandbox.restore.bind(sandbox);
const spy = sandbox.spy.bind(sandbox);
const stub = sandbox.stub.bind(sandbox);

describe('Module', function() {

  afterEach(restore);

  describe('constructor', function() {

    it('sets id and parent from arguments', function() {
      const parent = new Module('bar');
      const module = new Module('foo', parent);

      expect(module.id).to.equal('foo');
      expect(module.parent).to.equal(parent);
    });

    it('without arguments sets default values', function() {
      const module = new Module();

      expect(module.id).to.equal('');
      expect(module.parent).to.be.null;
      expect(module.exports).to.eql({});
    });

    it('sets initial values', function() {
      const module = new Module('foo');

      expect(module.exports).to.eql({});
    });

    it('runs loader lazily', function() {
      const loader = spy(mod => {
        mod.exports.foo = 'bar';
      });

      const module = new Module('foo', null, loader);

      expect(loader).to.have.not.been.called;
      expect(module.exports).to.eql({foo: 'bar'});
      expect(loader).to.have.been.called;
    });

    it('runs loader with parameters', function() {
      const loader = spy();

      const module = new Module('./foo/bar.js', null, loader);

      expect(loader).to.have.been.calledWith(module, module.exports);
      expect(loader.args[0][2]).to.be.a('function');
      expect(loader.args[0][3]).to.equal('/foo/bar.js');
      expect(loader.args[0][4]).to.equal('/foo');
    });

  });

  describe('instance', function() {

    beforeEach(function() {
      global.tabris = {} as ProtoTabris;
      tabris._client = {
        load: () => '',
        execute: () => ({executeResult: null}),
        loadAndExecute: () => ({
          executeResult: (module: Module) => {
            module.exports = module;
          }
        })
      };
    });

    let instance: Module;

    beforeEach(function() {
      instance = new Module();
    });

    describe('require', function() {

      it('returns exports', function() {
        stub(Module, 'createLoader').returns((_module: Module, exports: any) => {
          exports.bar = 1;
        });

        const foo = instance.require('./foo');

        expect(foo.bar).to.equal(1);
      });

      it('returns same exports for subsequent calls', function() {
        const exports1 = instance.require('./foo');
        const exports2 = instance.require('./foo');

        expect(exports1).to.equal(exports2);
      });

      it('returns module that is currently loading', function() {
        stub(Module, 'createLoader').returns((_mod: any, exports: any) => {
          exports.foo = 1;
          instance.require('./foo').bar = 2;
        });

        expect(instance.require('./foo')).to.eql({foo: 1, bar: 2});
      });

      it('returns native module', function() {
        const native = new Module('native', instance, {});

        expect(instance.require('native')).to.equal(native.exports);
      });

      it('returns same exports from different modules', function() {
        stub(Module, 'createLoader').returns((_mod: any, exports: any) => {
          exports.bar = 1;
        });
        const module1 = new Module('./module1', instance);
        const module2 = new Module('./module2', instance);

        const export1 = module1.require('./foo');
        const export2 = module2.require('./foo');

        expect(export1).to.eql({bar: 1});
        expect(export1).to.equal(export2);
      });

      it('requests url only once', function() {
        const stubbed = stub(Module, 'createLoader').returns((mod: Module) => {
          mod.exports = mod;
        });

        instance.require('./foo');
        instance.require('./foo');

        expect(stubbed.callCount).to.equal(1);
      });

      it('requests loader with request as path', function() {
        stub(Module, 'createLoader').returns((module: Module) => {
          module.exports = module;
        });

        instance.require('./bar');

        expect(Module.createLoader).to.have.been.calledWith('./bar');
      });

      it('requests alternate file name .js', function() {
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './foo.js') {
            return (mod: Module) => mod.exports = mod;
          }
          return null;
        });

        const foo = instance.require('./foo');

        expect(foo.id).to.equal('./foo.js');
        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
      });

      it('requests alternate file name .json', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns({data: 'bar'});

        const foo = instance.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests file specified in /package.json', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {main: 'bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        const foo = instance.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it('requests file specified in /package.json containing \'.\' segment', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {main: './bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        const foo = instance.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it('requests alternate file name /index.js', function() {
        spy(Module, 'readJSON');
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './foo/index.js') {
            return (mod: Module) => mod.exports = mod;
          }
          return null;
        });

        const foo = instance.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/package.json');
      });

      it('requests index.js if package.json has no main', function() {
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {notMain: './bar'};
          }
        });
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './foo/index.js') {
            return (mod: Module) => mod.exports = mod;
          }
          return null;
        });

        const foo = instance.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
      });

      it('requests alternate file name /index.json', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/index.json') {
            return {data: 'bar'};
          }
        });

        const foo = instance.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/index.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests alternate file name for folders', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns(null);

        try {
          instance.require('./foo/');
        } catch (error) {
          // expected
        }

        expect(Module.createLoader).not.to.have.been.calledWith('./foo');
        expect(Module.createLoader).not.to.have.been.calledWith('./foo.js');
        expect(Module.readJSON).not.to.have.been.calledWith('./foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/index.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo/index.json');
      });

      it('requests module from node_modules folder', function() {
        stub(Module, 'readJSON').returns(undefined);
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './node_modules/foo/index.js') {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => {};
          }
          return null;
        });

        instance.require('foo');

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('fails to requests module from node_modules folder with error', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns(null);

        expect(() => {
          instance.require('foo');
        }).to.throw('Cannot find module \'foo\'');

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests modules from node_modules folder at top-level', function() {
        instance = new Module('./foo/script.js');
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns(null);

        try {
          instance.require('bar');
        } catch (error) {
          // expected
        }

        expect(Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not requests modules node_modules/node_modules folder', function() {
        instance = new Module('./node_modules/foo/script.js');
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns(null);

        try {
          instance.require('bar');
        } catch (error) {
          // expected
        }

        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/node_modules/bar/package.json');
        expect(Module.readJSON).not.to.have.been.calledWith('./node_modules/node_modules/bar/package.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not request module from node_modules folder at top-level', function() {
        instance = new Module('./foo/script.js');
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './foo/node_modules/bar/script2.js') {
            return (mod: Module) => mod.exports = 2;
          }
          return null;
        });
        stub(Module, 'readJSON').callsFake((path) => {
          if (path === './foo/node_modules/bar/package.json') {
            return {main: 'script2.js'};
          }
        });

        expect(instance.require('bar')).to.equal(2);

        expect(Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/node_modules/bar/script2.js');
        expect(Module.readJSON).not.to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('fails if module cannot be found', function() {
        stub(Module, 'createLoader').returns(null);
        stub(Module, 'readJSON').returns(null);

        expect(() => {
          instance.require('foo');
        }).to.throw();

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests url variants only once', function() {
        const createLoaderStub = stub(Module, 'createLoader').returns(null);
        const readJsonStub = stub(Module, 'readJSON').returns({});

        instance.require('./foo');
        createLoaderStub.reset();
        readJsonStub.reset();
        instance.require('./foo');

        expect(createLoaderStub.callCount).to.equal(0);
        expect(readJsonStub.callCount).to.equal(0);
      });

      it('supports loading a package.json directly', function() {
        stub(Module, 'readJSON').callsFake((path) => {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
        });

        const exports = instance.require('./node_modules/foo/package.json');

        expect(exports).to.eql({main: 'foo.js'});
      });

      it('caches node modules', function() {
        const readJsonStub = stub(Module, 'readJSON').callsFake((url: string) => {
          if (url === './foo/package.json') {
            return {main: 'foo.js'};
          }
        });
        const createLoaderStub = stub(Module, 'createLoader').callsFake((url: string) => {
          if (url === './foo/foo.js') {
            return (mod: Module) => mod.exports = mod;
          }
          return null;
        });

        const foo1 = instance.require('./foo');
        createLoaderStub.reset();
        readJsonStub.reset();
        const foo2 = instance.require('./foo');

        expect(Module.createLoader).to.have.not.been.called;
        expect(Module.readJSON).to.have.not.been.called;
        expect(foo1).to.equal(foo2);
      });

      it('supports node modules loading each other', function() {
        stub(Module, 'readJSON').callsFake((path: string) => {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
          if (path === './node_modules/bar/package.json') {
            return {main: 'bar.js'};
          }
        });
        stub(Module, 'createLoader').callsFake((path: string) => {
          if (path === './node_modules/foo/foo.js') {
            return (module: Module) => {
              module.exports.x = 1;
              module.exports.y = module.require('bar');
            };
          }
          if (path === './node_modules/bar/bar.js') {
            return (module: Module) => {
              module.exports = module.require('foo').x + 1;
            };
          }
          return null;
        });

        const exports = instance.require('foo');

        expect(exports).to.eql({x: 1, y: 2});
      });

      describe('from plain module', function() {

        it('creates module with id', function() {
          const result = instance.require('./bar');

          expect(result.id).to.equal('./bar');
        });

        it('creates module with nested id', function() {
          const result = instance.require('./bar/baz');

          expect(result.id).to.equal('./bar/baz');
        });

        it('fails if requested id is outside of module root', function() {
          expect(() => {
            instance.require('../bar');
          }).to.throw();
        });

      });

      describe('from nested module', function() {

        beforeEach(function() {
          (instance.id as string) = './foo/bar.js';
        });

        it('creates module with plain id', function() {
          const result = instance.require('./baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it('during module loading creates module with plain id', function() {
          stub(Module, 'createLoader').callsFake((path: string) => {
            if (path === './foo/baz.js') {
              return (module, exports, require) => module.exports = require('./foo');
            }
            if (path === './foo/foo.js') {
              return module => module.exports = module;
            }
            return null;
          });

          const result = instance.require('./baz');

          expect(result.id).to.equal('./foo/foo.js');
        });

        it('handles path that starts with \'../\'', function() {
          const result = instance.require('../baz');

          expect(result.id).to.equal('./baz');
        });

        it('handles nested path that starts with \'../\'', function() {
          const result = instance.require('../bar/baz');

          expect(result.id).to.equal('./bar/baz');
        });

        it('handles path with enclosed \'/../\'', function() {
          const result = instance.require('./bar/../baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it('handles path with enclosed \'/./\'', function() {
          const result = instance.require('./bar/./baz');

          expect(result.id).to.equal('./foo/bar/baz');
        });

        it('handles path with multiple enclosed \'/./\' and \'/../\'', function() {
          const result = instance.require('././bar/.././baz');

          expect(result.id).to.equal('./foo/baz');
        });

      });

    });

  });

  describe('Module.createRequire', function() {

    beforeEach(function() {
      Module.root = new Module();
      stub(Module, 'createLoader').callsFake((path) => {
        if (path === './foo/baz.js') {
          return module => module.exports = module;
        }
        return null;
      });
    });

    after(function() {
      Module.root = new Module();
    });

    it('throws for missing argument', function() {
      const msg = 'The argument \'path\' must be an absolute path string. Received undefined';
      expect(() => (Module.createRequire as any)()).to.throw(Error, msg);
    });

    it('throws for invalid string', function() {
      const msg = 'The argument \'path\' must be an absolute path string. Received foo';
      expect(() => Module.createRequire('foo')).to.throw(Error, msg);
    });

    it('returns function for valid arguments', function() {
      expect(Module.createRequire('/package.json')).to.be.instanceOf(Function);
    });

    it('does not parse js module', function() {
      Module.createRequire('/package.json');
      expect(Module.createLoader).not.to.have.been.called;
    });

    it('does not parse json module', function() {
      spy(Module, 'readJSON');
      Module.createRequire('/package.json');
      expect(Module.readJSON).not.to.have.been.called;
    });

    it('returns require for given path', function() {
      expect(Module.createRequire('/foo/bar')('./baz').id).to.equal('./foo/baz.js');
    });

    it('returns require for root path', function() {
      expect(Module.createRequire('/')('./foo/baz').id).to.equal('./foo/baz.js');
    });

  });

  describe('Module.define', function() {

    let jsonFiles: {[path: string]: object};
    let loaders: {[path: string]: ModuleLoader};

    beforeEach(function() {
      Module.root = new Module();
      jsonFiles = {};
      loaders = {};
      stub(Module, 'createLoader').callsFake(url => loaders[url]);
      stub(Module, 'readJSON').callsFake(url => jsonFiles[url]);
    });

    after(function() {
      Module.root = new Module();
    });

    it('throws for relative path', function() {
      expect(() => Module.define('./subfolder2/foo.js', {})).to.throw(Error, 'Path needs to start with a "/"');
    });

    it('throws for global module', function() {
      expect(() => Module.define('subfolder2/foo.js', {})).to.throw(Error, 'Path needs to start with a "/"');
    });

    it('throws for missing exports', function() {
      expect(() => Module.define.call(Module, '/subfolder2/foo.js'))
        .to.throw(Error, 'Expected exactly 2 arguments, got 1');
    });

    it('throws for invalid path type', function() {
      expect(() => Module.define.call(Module, null, {}))
        .to.throw(Error, 'Expected argument 1 to be of type string');
    });

    it('creates virtual module', function() {
      const exported = {foo: {bar: 23}};
      loaders['./subfolder1/bar.js'] = mod => mod.exports = mod.require('../subfolder2/foo').foo;

      Module.define('/subfolder2/foo.js', exported);

      expect(Module.root.require('./subfolder1/bar.js')).to.equal(exported.foo);
    });

    it('throws for existing module', function() {
      Module.define('/subfolder2/foo.js', {});
      expect(() => Module.define('/subfolder2/foo.js', {}))
        .to.throw(Error, 'Module "/subfolder2/foo.js" is already defined');
    });

    it('throws for previously requested module', function() {
      try {
        Module.root.require('./subfolder1/bar.js');
        throw new Error('Module should not exist');
      } catch (ex) {
        // expected
      }
      expect(() => Module.define('/subfolder1/bar.js', {}))
        .to.throw(Error, 'Module "/subfolder1/bar.js" was accessed before it was defined');
    });

    it('throws for module instance', function() {
      expect(() => Module.define('/subfolder1/bar.js', Module.root))
        .to.throw(Error, 'Expected argument 2 to be module exports, got a module instance');
    });

  });

});

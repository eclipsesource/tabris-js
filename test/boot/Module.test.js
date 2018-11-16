import {expect, spy, stub, restore} from '../test';
import Module from '../../src/boot/Module';

describe('Module', function() {

  beforeEach(function() {
    global.tabris = {};
    tabris._client = {
      load: () => '',
      loadAndExecute: () => ({
        executeResult: (module) => {
          module.exports = module;
        }
      })
    };
  });

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

      expect(module.id).to.be.null;
      expect(module.parent).to.be.null;
      expect(module.exports).to.eql({});
    });

    it('sets initial values', function() {
      const module = new Module('foo');

      expect(module.exports).to.eql({});
    });

    it('runs loader lazily', function() {
      const loader = spy(module => {
        module.exports.foo = 'bar';
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

    let module;

    beforeEach(function() {
      module = new Module();
    });

    describe('require', function() {

      it('returns exports', function() {
        stub(Module, 'createLoader').returns((module, exports) => {
          exports.bar = 1;
        });

        const foo = module.require('./foo');

        expect(foo.bar).to.equal(1);
      });

      it('returns same exports for subsequent calls', function() {
        const exports1 = module.require('./foo');
        const exports2 = module.require('./foo');

        expect(exports1).to.equal(exports2);
      });

      it('returns module that is currently loading', function() {
        stub(Module, 'createLoader').returns((module, exports) => {
          exports.foo = 1;
          module.require('./foo').bar = 2;
        });

        expect(module.require('./foo')).to.eql({foo: 1, bar: 2});
      });

      it('returns native module', function() {
        const native = new Module('native', module, {});

        expect(module.require('native')).to.equal(native.exports);
      });

      it('returns same exports from different modules', function() {
        stub(Module, 'createLoader').returns((module, exports) => {
          exports.bar = 1;
        });
        const module1 = new Module('./module1', module);
        const module2 = new Module('./module2', module);

        const export1 = module1.require('./foo');
        const export2 = module2.require('./foo');

        expect(export1).to.eql({bar: 1});
        expect(export1).to.equal(export2);
      });

      it('requests url only once', function() {
        stub(Module, 'createLoader').returns((module) => {
          module.exports = module;
        });

        module.require('./foo');
        module.require('./foo');

        expect(Module.createLoader.callCount).to.equal(1);
      });

      it('requests loader with request as path', function() {
        stub(Module, 'createLoader').returns((module) => {
          module.exports = module;
        });

        module.require('./bar');

        expect(Module.createLoader).to.have.been.calledWith('./bar');
      });

      it('requests alternate file name .js', function() {
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './foo.js') {
            return module => module.exports = module;
          }
        });

        const foo = module.require('./foo');

        expect(foo.id).to.equal('./foo.js');
        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
      });

      it('requests alternate file name .json', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns({data: 'bar'});

        const foo = module.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests file specified in /package.json', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {main: 'bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        const foo = module.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it("requests file specified in /package.json containing '.' segment", function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {main: './bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        const foo = module.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it('requests alternate file name /index.js', function() {
        spy(Module, 'readJSON');
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './foo/index.js') {
            return module => module.exports = module;
          }
        });

        const foo = module.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/package.json');
      });

      it('requests index.js if package.json has no main', function() {
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {not_main: './bar'};
          }
        });
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './foo/index.js') {
            return module => module.exports = module;
          }
        });

        const foo = module.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
      });

      it('requests alternate file name /index.json', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/index.json') {
            return {data: 'bar'};
          }
        });

        const foo = module.require('./foo');

        expect(Module.createLoader).to.have.been.calledWith('./foo');
        expect(Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/index.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests alternate file name for folders', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns(undefined);

        try {
          module.require('./foo/');
        } catch (error) {
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
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './node_modules/foo/index.js') {
            return () => {};
          }
        });

        module.require('foo');

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('fails to requests module from node_modules folder with error', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns(undefined);

        expect(() => {
          module.require('foo');
        }).to.throw("Cannot find module 'foo'");

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests modules from node_modules folder at top-level', function() {
        module = new Module('./foo/script.js');
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns(undefined);

        try {
          module.require('bar');
        } catch (error) {
        }

        expect(Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not requests modules node_modules/node_modules folder', function() {
        module = new Module('./node_modules/foo/script.js');
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns(undefined);

        try {
          module.require('bar');
        } catch (error) {
        }

        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/node_modules/bar/package.json');
        expect(Module.readJSON).not.to.have.been.calledWith('./node_modules/node_modules/bar/package.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not request module from node_modules folder at top-level', function() {
        module = new Module('./foo/script.js');
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './foo/node_modules/bar/script2.js') {
            return (module) => module.exports = 2;
          }
        });
        stub(Module, 'readJSON').callsFake((path) => {
          if (path === './foo/node_modules/bar/package.json') {
            return {main: 'script2.js'};
          }
        });

        expect(module.require('bar')).to.equal(2);

        expect(Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./foo/node_modules/bar/script2.js');
        expect(Module.readJSON).not.to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('fails if module cannot be found', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns(undefined);

        expect(() => {
          module.require('foo');
        }).to.throw();

        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests url variants only once', function() {
        stub(Module, 'createLoader').returns(undefined);
        stub(Module, 'readJSON').returns({});

        module.require('./foo');
        Module.createLoader.reset();
        Module.readJSON.reset();
        module.require('./foo');

        expect(Module.createLoader.callCount).to.equal(0);
        expect(Module.readJSON.callCount).to.equal(0);
      });

      it('supports loading a package.json directly', function() {
        stub(Module, 'readJSON').callsFake((path) => {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
        });

        const exports = module.require('./node_modules/foo/package.json');

        expect(exports).to.eql({main: 'foo.js'});
      });

      it('caches node modules', function() {
        stub(Module, 'readJSON').callsFake((url) => {
          if (url === './foo/package.json') {
            return {main: 'foo.js'};
          }
        });
        stub(Module, 'createLoader').callsFake((url) => {
          if (url === './foo/foo.js') {
            return module => module.exports = module;
          }
        });

        const foo1 = module.require('./foo');
        Module.createLoader.reset();
        Module.readJSON.reset();
        const foo2 = module.require('./foo');

        expect(Module.createLoader).to.have.not.been.called;
        expect(Module.readJSON).to.have.not.been.called;
        expect(foo1).to.equal(foo2);
      });

      it('supports node modules loading each other', function() {
        stub(Module, 'readJSON').callsFake((path) => {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
          if (path === './node_modules/bar/package.json') {
            return {main: 'bar.js'};
          }
        });
        stub(Module, 'createLoader').callsFake((path) => {
          if (path === './node_modules/foo/foo.js') {
            return (module) => {
              module.exports.x = 1;
              module.exports.y = module.require('bar');
            };
          }
          if (path === './node_modules/bar/bar.js') {
            return (module) => {
              module.exports = module.require('foo').x + 1;
            };
          }
        });

        const exports = module.require('foo');

        expect(exports).to.eql({x: 1, y: 2});
      });

      describe('from plain module', function() {

        it('creates module with id', function() {
          const result = module.require('./bar');

          expect(result.id).to.equal('./bar');
        });

        it('creates module with nested id', function() {
          const result = module.require('./bar/baz');

          expect(result.id).to.equal('./bar/baz');
        });

        it('fails if requested id is outside of module root', function() {
          expect(() => {
            module.require('../bar');
          }).to.throw();
        });

      });

      describe('from nested module', function() {

        beforeEach(function() {
          module.id = './foo/bar.js';
        });

        it('creates module with plain id', function() {
          const result = module.require('./baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it('during module loading creates module with plain id', function() {
          stub(Module, 'createLoader').callsFake((path) => {
            if (path === './foo/baz.js') {
              return (module, exports, require) => module.exports = require('./foo');
            }
            if (path === './foo/foo.js') {
              return module => module.exports = module;
            }
          });

          const result = module.require('./baz');

          expect(result.id).to.equal('./foo/foo.js');
        });

        it("handles path that starts with '../'", function() {
          const result = module.require('../baz');

          expect(result.id).to.equal('./baz');
        });

        it("handles nested path that starts with '../'", function() {
          const result = module.require('../bar/baz');

          expect(result.id).to.equal('./bar/baz');
        });

        it("handles path with enclosed '/../'", function() {
          const result = module.require('./bar/../baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it("handles path with enclosed '/./'", function() {
          const result = module.require('./bar/./baz');

          expect(result.id).to.equal('./foo/bar/baz');
        });

        it("handles path with multiple enclosed '/./' and '/../'", function() {
          const result = module.require('././bar/.././baz');

          expect(result.id).to.equal('./foo/baz');
        });

      });

    });

  });

});

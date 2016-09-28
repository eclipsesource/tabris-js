import {expect, spy, stub, restore} from '../test';
import '../../src/boot/Module';

describe('tabris.Module', function() {

  beforeEach(function() {
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
      let parent = new tabris.Module('bar');
      let module = new tabris.Module('foo', parent);

      expect(module.id).to.equal('foo');
      expect(module.parent).to.equal(parent);
    });

    it('without arguments sets default values', function() {
      let module = new tabris.Module();

      expect(module.id).to.be.null;
      expect(module.parent).to.be.null;
      expect(module.exports).to.eql({});
    });

    it('sets initial values', function() {
      let module = new tabris.Module('foo');

      expect(module.exports).to.eql({});
    });

    it('runs loader lazily', function() {
      let loader = spy(module => {
        module.exports.foo = 'bar';
      });

      let module = new tabris.Module('foo', null, loader);

      expect(loader).to.have.not.been.called;
      expect(module.exports).to.eql({foo: 'bar'});
      expect(loader).to.have.been.called;
    });

    it('runs loader with parameters', function() {
      let loader = spy();

      let module = new tabris.Module('./foo/bar.js', null, loader);

      expect(loader).to.have.been.calledWith(module, module.exports);
      expect(loader.args[0][2]).to.be.a('function');
      expect(loader.args[0][3]).to.equal('/foo/bar.js');
      expect(loader.args[0][4]).to.equal('/foo');
    });

  });

  describe('instance', function() {

    let module;

    beforeEach(function() {
      module = new tabris.Module();
    });

    describe('require', function() {

      it('returns exports', function() {
        stub(tabris.Module, 'createLoader').returns((module, exports) => {
          exports.bar = 1;
        });

        let foo = module.require('./foo');

        expect(foo.bar).to.equal(1);
      });

      it('returns same exports for subsequent calls', function() {
        let exports1 = module.require('./foo');
        let exports2 = module.require('./foo');

        expect(exports1).to.equal(exports2);
      });

      it('returns module that is currently loading', function() {
        stub(tabris.Module, 'createLoader').returns((module, exports) => {
          exports.foo = 1;
          module.require('./foo').bar = 2;
        });

        expect(module.require('./foo')).to.eql({foo: 1, bar: 2});
      });

      it('returns native module', function() {
        let native = new tabris.Module('native', module, {});

        expect(module.require('native')).to.equal(native.exports);
      });

      it('returns same exports from different modules', function() {
        stub(tabris.Module, 'createLoader').returns((module, exports) => {
          exports.bar = 1;
        });
        let module1 = new tabris.Module('./module1', module);
        let module2 = new tabris.Module('./module2', module);

        let export1 = module1.require('./foo');
        let export2 = module2.require('./foo');

        expect(export1).to.eql({bar: 1});
        expect(export1).to.equal(export2);
      });

      it('requests url only once', function() {
        stub(tabris.Module, 'createLoader').returns((module) => {
          module.exports = module;
        });

        module.require('./foo');
        module.require('./foo');

        expect(tabris.Module.createLoader.callCount).to.equal(1);
      });

      it('requests loader with request as path', function() {
        stub(tabris.Module, 'createLoader').returns((module) => {
          module.exports = module;
        });

        module.require('./bar');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./bar');
      });

      it('requests alternate file name .js', function() {
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './foo.js') {
            return function(module) {module.exports = module;};
          }
        });

        let foo = module.require('./foo');

        expect(foo.id).to.equal('./foo.js');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo.js');
      });

      it('requests alternate file name .json', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns({data: 'bar'});

        let foo = module.require('./foo');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests file specified in /package.json', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON', function(url) {
          if (url === './foo/package.json') {
            return {main: 'bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        let foo = module.require('./foo');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it("requests file specified in /package.json containing '.' segment", function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON', function(url) {
          if (url === './foo/package.json') {
            return {main: './bar'};
          }
          if (url === './foo/bar/index.json') {
            return {modulename: 'bar'};
          }
        });

        let foo = module.require('./foo');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/bar.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/bar/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/bar/index.js');
        expect(foo).to.eql({modulename: 'bar'});
      });

      it('requests alternate file name /index.js', function() {
        spy(tabris.Module, 'readJSON');
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './foo/index.js') {
            return function(module) {module.exports = module;};
          }
        });

        let foo = module.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/package.json');
      });

      it('requests index.js if package.json has no main', function() {
        stub(tabris.Module, 'readJSON', function(url) {
          if (url === './foo/package.json') {
            return {not_main: './bar'};
          }
        });
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './foo/index.js') {
            return function(module) {module.exports = module;};
          }
        });

        let foo = module.require('./foo');

        expect(foo.id).to.equal('./foo/index.js');
      });

      it('requests alternate file name /index.json', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON', function(url) {
          if (url === './foo/index.json') {
            return {data: 'bar'};
          }
        });

        let foo = module.require('./foo');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/index.js');
        expect(foo).to.eql({data: 'bar'});
      });

      it('requests alternate file name for folders', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns(undefined);

        try {
          module.require('./foo/');
        } catch (error) {
        }

        expect(tabris.Module.createLoader).not.to.have.been.calledWith('./foo');
        expect(tabris.Module.createLoader).not.to.have.been.calledWith('./foo.js');
        expect(tabris.Module.readJSON).not.to.have.been.calledWith('./foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/index.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/index.json');
      });

      it('requests module from node_modules folder', function() {
        stub(tabris.Module, 'readJSON').returns(undefined);
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './node_modules/foo/index.js') {
            return function() {};
          }
        });

        module.require('foo');

        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('fails to requests module from node_modules folder with error', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns(undefined);

        expect(() => {
          module.require('foo');
        }).to.throw("Cannot find module 'foo'");

        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests modules from node_modules folder at top-level', function() {
        module = new tabris.Module('./foo/script.js');
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns(undefined);

        try {
          module.require('bar');
        } catch (error) {
        }

        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not requests modules node_modules/node_modules folder', function() {
        module = new tabris.Module('./node_modules/foo/script.js');
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns(undefined);

        try {
          module.require('bar');
        } catch (error) {
        }

        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo/node_modules/bar/package.json');
        expect(tabris.Module.readJSON).not.to.have.been.calledWith('./node_modules/node_modules/bar/package.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('does not request module from node_modules folder at top-level', function() {
        module = new tabris.Module('./foo/script.js');
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './foo/node_modules/bar/script2.js') {
            return function(module) {module.exports = 2;};
          }
        });
        stub(tabris.Module, 'readJSON', function(path) {
          if (path === './foo/node_modules/bar/package.json') {
            return {main: 'script2.js'};
          }
        });

        expect(module.require('bar')).to.equal(2);

        expect(tabris.Module.readJSON).to.have.been.calledWith('./foo/node_modules/bar/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./foo/node_modules/bar/script2.js');
        expect(tabris.Module.readJSON).not.to.have.been.calledWith('./node_modules/bar/package.json');
      });

      it('fails if module cannot be found', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns(undefined);

        expect(() => {
          module.require('foo');
        }).to.throw();

        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo.js');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo.json');
        expect(tabris.Module.readJSON).to.have.been.calledWith('./node_modules/foo/package.json');
        expect(tabris.Module.createLoader).to.have.been.calledWith('./node_modules/foo/index.js');
      });

      it('requests url variants only once', function() {
        stub(tabris.Module, 'createLoader').returns(undefined);
        stub(tabris.Module, 'readJSON').returns({});

        module.require('./foo');
        tabris.Module.createLoader.reset();
        tabris.Module.readJSON.reset();
        module.require('./foo');

        expect(tabris.Module.createLoader.callCount).to.equal(0);
        expect(tabris.Module.readJSON.callCount).to.equal(0);
      });

      it('supports loading a package.json directly', function() {
        stub(tabris.Module, 'readJSON', function(path) {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
        });

        let exports = module.require('./node_modules/foo/package.json');

        expect(exports).to.eql({main: 'foo.js'});
      });

      it('caches node modules', function() {
        stub(tabris.Module, 'readJSON', function(url) {
          if (url === './foo/package.json') {
            return {main: 'foo.js'};
          }
        });
        stub(tabris.Module, 'createLoader', (url) => {
          if (url === './foo/foo.js') {
            return function(module) {
              module.exports = module;
            };
          }
        });

        let foo1 = module.require('./foo');
        tabris.Module.createLoader.reset();
        tabris.Module.readJSON.reset();
        let foo2 = module.require('./foo');

        expect(tabris.Module.createLoader).to.have.not.been.called;
        expect(tabris.Module.readJSON).to.have.not.been.called;
        expect(foo1).to.equal(foo2);
      });

      it('supports node modules loading each other', function() {
        stub(tabris.Module, 'readJSON', function(path) {
          if (path === './node_modules/foo/package.json') {
            return {main: 'foo.js'};
          }
          if (path === './node_modules/bar/package.json') {
            return {main: 'bar.js'};
          }
        });
        stub(tabris.Module, 'createLoader', (path) => {
          if (path === './node_modules/foo/foo.js') {
            return function(module) {
              module.exports.x = 1;
              module.exports.y = module.require('bar');
            };
          }
          if (path === './node_modules/bar/bar.js') {
            return function(module) {
              module.exports = module.require('foo').x + 1;
            };
          }
        });

        let exports = module.require('foo');

        expect(exports).to.eql({x: 1, y: 2});
      });

      describe('from plain module', function() {

        it('creates module with id', function() {
          let result = module.require('./bar');

          expect(result.id).to.equal('./bar');
        });

        it('creates module with nested id', function() {
          let result = module.require('./bar/baz');

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
          let result = module.require('./baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it('during module loading creates module with plain id', function() {
          stub(tabris.Module, 'createLoader', (path) => {
            if (path === './foo/baz.js') {
              return function(module, exports, require) {
                module.exports = require('./foo');
              };
            }
            if (path === './foo/foo.js') {
              return function(module) {module.exports = module;};
            }
          });

          let result = module.require('./baz');

          expect(result.id).to.equal('./foo/foo.js');
        });

        it("handles path that starts with '../'", function() {
          let result = module.require('../baz');

          expect(result.id).to.equal('./baz');
        });

        it("handles nested path that starts with '../'", function() {
          let result = module.require('../bar/baz');

          expect(result.id).to.equal('./bar/baz');
        });

        it("handles path with enclosed '/../'", function() {
          let result = module.require('./bar/../baz');

          expect(result.id).to.equal('./foo/baz');
        });

        it("handles path with enclosed '/./'", function() {
          let result = module.require('./bar/./baz');

          expect(result.id).to.equal('./foo/bar/baz');
        });

        it("handles path with multiple enclosed '/./' and '/../'", function() {
          let result = module.require('././bar/.././baz');

          expect(result.id).to.equal('./foo/baz');
        });

      });

    });

  });

});

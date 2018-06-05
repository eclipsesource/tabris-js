import {expect, spy, stub, restore} from '../test';
import {createConsole} from '../../src/tabris/Console';
import * as defaultConsole from '../../src/tabris/Console';

const methods = ['debug', 'log', 'info', 'warn', 'error'];
const realConsole = console;

describe('Console', function() {

  afterEach(restore);

  describe('default', function() {

    let globalConsole = {};

    beforeEach(function() {
      globalConsole = {};
      methods.forEach(method => {
        globalConsole[method] = stub();
        spy(realConsole, method);
      });
      global.console = globalConsole;
    });

    afterEach(function() {
      global.console = realConsole;
    });

    methods.forEach(method => describe(method, function() {

      it('forwards call to real console', function() {
        defaultConsole[method](1, 2, 3);
        expect(realConsole[method]).to.have.been.calledWith(1, 2, 3);
      });

      it('does not call current global console', function() {
        defaultConsole[method](1, 2, 3);
        expect(globalConsole[method]).not.to.have.been.calledWith(1, 2, 3);
      });

    }));

  });

  describe('new instance', function() {

    let console, nativeConsole;

    beforeEach(function() {
      nativeConsole = {
        print: spy()
      };
      console = createConsole(nativeConsole);
    });

    methods.forEach(method => describe(method, function() {

      it('succeeds without arguments', function() {
        console[method]();
        expect(nativeConsole.print).to.have.been.calledWithMatch(method, '');
      });

      it('concatenates multiple arguments', function() {
        console[method]('foo', 23);
        expect(nativeConsole.print).to.have.been.calledWithMatch(method, 'foo 23');
      });

      it('replaces placeholders with arguments', function() {
        console[method]('foo %dk', 23);
        expect(nativeConsole.print).to.have.been.calledWithMatch(method, 'foo 23k');
      });

    }));

  });

  describe('Console print trigger log event', function() {

    let console, nativeConsole;

    beforeEach(function() {
      nativeConsole = {
        print: spy()
      };
      console = createConsole(nativeConsole);
    });

    methods.forEach(method => describe(method, function() {

      it(`fire event on ${method} without arguments`, function() {
        const listener = spy();
        tabris.on('log', listener);
        console[method]();
        expect(listener).to.have.been.calledOnce;
      });

      it(`fire event on ${method} with multiple arguments`, function() {
        const listener = spy();
        tabris.on('log', listener);
        console[method]('foo', 'bar', 0, 1);
        expect(listener).to.have.been.calledOnce;
      });

      it(`fire event on ${method} when replacing placeholders with arguments`, function() {
        const listener = spy();
        tabris.on('log', listener);
        console[method]('%s %s %d %d', 'foo', 'bar', 0, 1);
        expect(listener).to.have.been.calledOnce
        && expect(nativeConsole.print).to.have.been.calledWithMatch(method, 'foo bar 0 1');
      });

    }));

  });

});

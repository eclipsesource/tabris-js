import {expect, spy, restore} from '../test';
import {createConsole} from '../../src/tabris/Console';

describe('Console', function() {

  let console, nativeConsole;

  beforeEach(function() {
    nativeConsole = {
      print: spy()
    };
    console = createConsole(nativeConsole);
  });

  afterEach(restore);

  ['debug', 'log', 'info', 'warn', 'error'].forEach(method => describe(method, function() {

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

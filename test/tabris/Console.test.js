import {expect, spy, stub, restore, mockTabris} from '../test';
import ClientStub from './ClientStub';
import {createConsole} from '../../src/tabris/Console';
import * as defaultConsole from '../../src/tabris/Console';
import {create as createApp} from '../../src/tabris/App';

const methods = ['debug', 'log', 'info', 'warn', 'error'];
const realConsole = console;

describe('Console', function() {

  let client;

  afterEach(restore);

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

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

      describe('grouping', function() {

        it('prints spaces', function() {
          const groupTitle = 'group message', groupMessage = 'this message should contains prefix spaces';

          console.group(groupTitle);
          console[method](groupMessage);

          expect(nativeConsole.print).to.have.calledTwice;
          expect(getCallOutput(nativeConsole.print)).to.equal(`log${groupTitle}\n${method}  ${groupMessage}`);
        });

        it('does not print space after groupEnd method', function() {
          const groupTitle = 'group message', groupMessage = 'this message should contains prefix spaces',
            normalMessage = 'this is a normal message without prefix spaces';

          console.group(groupTitle);
          console[method](groupMessage);
          console.groupEnd();
          console[method](normalMessage);

          const callOutput = getCallOutput(nativeConsole.print);
          expect(callOutput).to.equal(`log${groupTitle}\n${method}  ${groupMessage}\n${method}${normalMessage}`);
        });

      });

    }));

    describe('assert', function() {

      it('prints an error message when expression is false', function() {
        console.assert(1 === 2, '%s is not equal to %s', 1, 2);
        expect(nativeConsole.print).to.have.been.calledWith('error', 'Assertion failed: 1 is not equal to 2');
      });

      it('does nothing when expression is true', function() {
        console.assert(1 === 1, '%s is equal to %s', 1, 1);
        expect(nativeConsole.print).not.to.have.been.called;
      });

    });

    describe('count', function() {

      it('uses "default" as label if none is given', function() {
        console.count();
        console.count();

        const output = getCallOutput(nativeConsole.print);
        expect(output).to.contain('default: 1');
        expect(output).to.contain('default: 2');
      });

      it('uses the given label', function() {
        const label = 'my label';

        console.count(label);
        console.count(label);

        const output = getCallOutput(nativeConsole.print);
        expect(output).to.contain(`${label}: 1`);
        expect(output).to.contain(`${label}: 2`);
      });

      it('does not reset when different label is used', function() {
        const label = 'my label', secondLabel = 'my second label';

        console.count(label);
        console.count(secondLabel);
        console.count(label);
        console.count(secondLabel);

        const output = getCallOutput(nativeConsole.print);
        expect(output).to.contain(`${label}: 1`);
        expect(output).to.contain(`${label}: 2`);
        expect(output).not.to.contain(`${label}: 3`);
        expect(output).to.contain(`${secondLabel}: 1`);
        expect(output).to.contain(`${secondLabel}: 2`);
        expect(output).not.to.contain(`${secondLabel}: 3`);
      });

    });

    describe('countReset', function() {

      it('reset counter if label is supplied', function() {
        const label = 'my label';

        console.count(label);
        console.count(label);
        console.countReset(label);

        const output = getCallOutput(nativeConsole.print);
        expect(output).to.contain(`${label}: 1`);
        expect(output).to.contain(`${label}: 2`);
        expect(output).to.contain(`${label}: 0`);
      });

      it('reset counter if label is omitted', function() {
        console.count();
        console.count();
        console.countReset();

        const output = getCallOutput(nativeConsole.print);
        expect(output).to.contain('default: 1');
        expect(output).to.contain('default: 2');
        expect(output).to.contain('default: 0');
      });

    });

    describe('dirxml', function() {

      it('prints xml when object has toXML', function() {
        console.dirxml({toXML() { return '<Foo/>'; }});
        expect(nativeConsole.print).to.have.been.calledWithMatch('log', '<Foo/>');
      });

      it('does not print xml tree when object does not have toXML', function() {
        const object = {id: 'widget'};
        console.dirxml(object);
        expect(nativeConsole.print).to.have.been.calledWithMatch('log', "{ id: 'widget' }");
      });

    });

    describe('trace', function() {

      let stack;
      const stacks = {
        Android:
`Error
  at doSomethingElse (./dist/console.js:23:17)
  at doSomething (./dist/console.js:20:5)
  at Button.start (./dist/console.js:17:17)
  at ./node_modules/tabris/tabris.min.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:74931)`,
        iOS:
`doSomethingElse@http://192.168.6.77:8080/dist/console.js:23:17
doSomething@http://192.168.6.77:8080/dist/console.js:20:5
start@http://192.168.6.77:8080/dist/console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:74931
_notify@[native code]`
      };

      class CustomError extends Error {

        constructor(message) {
          super(message);
          this.orgStack = this.stack;
          this.stack = stack;
        }
      }

      const OrgError = Error;

      beforeEach(function() {
        global.Error = CustomError;
        tabris.app = createApp();
      });

      afterEach(function() {
        global.Error = OrgError;
      });

      ['Android', 'iOS'].forEach(function(platform) {

        it(platform + ' prints simplified stack trace', function() {
          tabris.device.platform = platform;
          stack = stacks[platform];
          const expected = 'doSomethingElse (./dist/console.js:23:17)\n' +
            'doSomething (./dist/console.js:20:5)\n' +
            'start (./dist/console.js:17:17)';

          console.trace();

          expect(nativeConsole.print).to.have.been.calledWith('log', expected);
        });

      });

    });

  });

  describe('Console print trigger log event', function() {

    let console, nativeConsole, listener;

    beforeEach(function() {
      nativeConsole = {
        print: spy()
      };
      listener = spy();
      tabris.on('log', listener);
      console = createConsole(nativeConsole);
    });

    methods.forEach(method => describe(method, function() {

      it(`fire event on ${method} without arguments`, function() {
        console[method]();
        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({level: method, message: ''});
      });

      it(`fire event on ${method} with multiple arguments`, function() {
        console[method]('foo', 'bar', 0, 1);
        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({level :method, message: 'foo bar 0 1'});
      });

      it(`fire event on ${method} when replacing placeholders with arguments`, function() {
        console[method]('%s %s %d %d', 'foo', 'bar', 0, 1);
        expect(listener).to.have.been.calledOnce;
        expect(listener).to.have.been.calledWithMatch({level :method, message: 'foo bar 0 1'});
      });

    }));

  });

});

function getCallOutput(spyInstance) {
  const messages = [];
  for (const call of spyInstance.getCalls()) {
    messages.push(call.args
      .map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg)
      .join(''));
  }
  return messages.join('\n');
}

import {expect, stub, restore, mockTabris} from '../test';
import ClientStub from './ClientStub';
import {addWindowTimerMethods}  from '../../src/tabris/WindowTimers';
import {create as createApp} from '../../src/tabris/App';
import {getStackTrace} from '../../src/tabris/util-stacktrace';

describe('util-stacktrace', function() {

  let client;

  const stacks = {
    Android: {
      production:
`Error
  at doSomethingElse (./dist/console.js:23:17)
  at doSomething (./dist/console.js:20:5)
  at Button.start (./dist/console.js:17:17)
  at ./node_modules/tabris/tabris.min.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:74931)`,
      debug:
`Error
  at doSomethingElse (./dist/console.js:23:17)
  at doSomething (./dist/console.js:20:5)
  at Button.start (./dist/console.js:17:17)
  at ./node_modules/tabris/tabris.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.js:1:74931)`,
      timer2:
`Error
  at done (./dist/timer.js:19:17)
  at sayThanks (./dist/timer.js:16:5)
  at callback (./node_modules/tabris/tabris.min.js:1:94811)`,
      timer1:
`Error
  at createTimer (./node_modules/tabris/tabris.min.js:1:94713)
  at start (./dist/timer.js:10:9)
  at ./node_modules/tabris/tabris.min.js:1:29551
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:29715)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:50664)
  at Button._trigger (./node_modules/tabris/tabris.min.js:1:50434)
  at Button._trigger (./node_modules/tabris/tabris.min.js:1:59239)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:77730)`
    },
    iOS: {
      production:
`doSomethingElse@http://192.168.6.77:8080/dist/console.js:23:17
doSomething@http://192.168.6.77:8080/dist/console.js:20:5
start@http://192.168.6.77:8080/dist/console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:74931
_notify@[native code]`,
      debug:
`doSomethingElse@http://192.168.6.77:8080/dist/console.js:23:17
doSomething@http://192.168.6.77:8080/dist/console.js:20:5
start@http://192.168.6.77:8080/dist/console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:74931
_notify@[native code]`,
      timer2:
`_notify@[native code]
done@http://192.168.6.77:8080/dist/timer.js:19:17
sayThanks@http://192.168.6.77:8080/dist/timer.js:16:5
callback@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:94847`,
      timer1:
`createTimer@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:94722
start@http://192.168.6.77:8080/dist/timer.js:10:9
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:29555
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:29715
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:50671
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:77738`,
    },
    expected: {
      simplified:
`doSomethingElse (./dist/console.js:23:17)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)`,
      full:
`doSomethingElse (./dist/console.js:23:17)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
./node_modules/tabris/tabris.js:1:27243
trigger (./node_modules/tabris/tabris.js:1:27407)
$trigger (./node_modules/tabris/tabris.js:1:48355)
_notify (./node_modules/tabris/tabris.js:1:74931)`,
      timer:
`done (./dist/timer.js:19:17)
sayThanks (./dist/timer.js:16:5)
start (./dist/timer.js:10:9)`,
      timerNested:
`done (./dist/timer.js:19:17)
sayThanks (./dist/timer.js:16:5)
doSomethingElse (./dist/console.js:23:17)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
start (./dist/timer.js:10:9)`,
      timerParallel:
`doSomethingElse (./dist/console.js:23:17)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
start (./dist/timer.js:10:9)`
    }
  };

  beforeEach(function() {
    client = new ClientStub();
    mockTabris(client);
  });

  afterEach(function() {
    restore();
  });

  ['Android', 'iOS'].forEach(function(platform) {

    describe('getStackTrace (' + platform + ')', function() {

      beforeEach(function() {
        tabris.device.platform = platform;
        tabris.app = createApp();
      });

      it('prints simplified stack trace in production', function() {
        expect(getStackTrace({stack: stacks[platform].production})).to.equal(stacks.expected.simplified);
      });

      it('prints full stack trace in debug mode (non-minified)', function() {
        expect(getStackTrace({stack: stacks[platform].debug})).to.equal(stacks.expected.full);
      });

      describe('with source maps', function() {

        let sourceMapCopy;

        const sourceMap = {
          version: 3,
          file: 'console.js',
          sourceRoot: '',
          sources: ['../console.js'],
          names: [],
          mappings: ';;AAAA,mCAA6C;AAE7C,IAAI,YAAY,GAAG,IAAI,kBAAS,CAAC;IAC/B,IAAI,EAAE,EAAE,EAAE,GAAG,EAAE,EAAE,EAAE,KAAK,EAAE,EAAE;IAC5B,IAAI,EAAE,SAAS;IACf,OAAO,EAAE,aAAa;CACvB,CAAC,CAAC,QAAQ,CAAC,WAAE,CAAC,WAAW,CAAC,CAAC;AAE5B,CAAC,OAAO,EAAE,KAAK,EAAE,MAAM,EAAE,MAAM,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC,OAAO,CAAC,CAAC,MAAM,EAAE,EAAE;IACpE,IAAI,eAAM,CAAC;QACT,IAAI,EAAE,EAAE,EAAE,KAAK,EAAE,EAAE,EAAE,GAAG,EAAE,WAAW;QACrC,IAAI,EAAE,MAAM;KACb,CAAC,CAAC,EAAE,CAAC,QAAQ,EAAG,KAAK,CAAC;SACtB,QAAQ,CAAC,WAAE,CAAC,WAAW,CAAC,CAAC;AAC5B,CAAC,CAAC,CAAC;AAEH,SAAS,KAAK;IACZ,MAAM,GAAG,GAAW,WAAW,EAAE,CAAC;AACpC,CAAC;AAED,SAAS,WAAW;IACnB,eAAe,EAAE,CAAC;AACnB,CAAC;AAED,SAAS,eAAe;IACtB,OAAO,CAAC,GAAG,CAAC,IAAI,KAAK,EAAE,CAAC,KAAK,CAAC,CAAC;AACjC,CAAC'// eslint-disable-line
        };

        const sourceMappedStack = 'doSomethingElse (./console.js:26:15)\n' +
          'doSomething (./console.js:22:2)\n' +
          'start (./console.js:18:23)';

        beforeEach(function() {
          sourceMapCopy = Object.assign({}, sourceMap);
        });

        it('prints source-mapped stack trace', function() {
          stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);
          expect(getStackTrace({stack: stacks[platform].production})).to.equal(sourceMappedStack);
        });

        it('caches parsed mappings', function() {
          stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);
          getStackTrace({stack: stacks[platform].production});

          sourceMapCopy.mappings = '';

          expect(getStackTrace({stack: stacks[platform].production})).to.equal(sourceMappedStack);
        });

        it('does not cache source map itself', function() {
          stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);
          getStackTrace({stack: stacks[platform].production});
          tabris.Module.getSourceMap.resetBehavior();

          expect(getStackTrace({stack: stacks[platform].production})).to.equal(stacks.expected.simplified);
        });

        it('skips lines with no mapping', function() {
          sourceMapCopy.mappings = sourceMapCopy.mappings.split(';').slice(0, -2).join(';');
          stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);

          expect(getStackTrace({stack: stacks[platform].production})).to.equal(
            'doSomething (./console.js:22:2)\nstart (./console.js:18:23)'
          );
        });

        it('prints original stack trace for malformed sourceMap', function() {
          sourceMapCopy.mappings = 'not-valid-mappings';
          stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);

          expect(getStackTrace({stack: stacks[platform].production})).to.equal(stacks[platform].production);
        });

      });

      describe('across timer', function() {

        let stack, timers;

        function callback(index) {
          return client.calls({id: tabris.app.cid, op: 'call', method: 'startTimer'})[index].parameters.callback;
        }

        class CustomError extends Error {

          constructor(message) {
            super(message);
            this.orgStack = this.stack;
            this.stack = stack;
          }
        }

        const OrgError = Error;

        beforeEach(function() {
          timers = {};
          addWindowTimerMethods(timers);
        });

        afterEach(function() {
          global.Error = OrgError;
        });

        it('prints stack trace across timer', function() {
          global.Error = CustomError;
          stack = stacks[platform].timer1;
          let actual;

          timers.setTimeout(() => actual = getStackTrace({stack: stacks[platform].timer2}));
          callback(0)();

          expect(actual).to.equal(stacks.expected.timer);
        });

        it('prints stack trace across nested timers', function() {
          global.Error = CustomError;
          stack = stacks[platform].timer1;
          let actual;

          timers.setTimeout(() => {
            stack = stacks[platform].production;
            timers.setTimeout(() => actual = getStackTrace({stack: stack = stacks[platform].timer2}));
          });
          callback(0)();
          callback(1)();

          expect(actual).to.equal(stacks.expected.timerNested);
        });

        it('prints stack trace across parallel timers', function() {
          global.Error = CustomError;
          stack = stacks[platform].timer1;
          let actual1, actual2;

          timers.setTimeout(() => actual1 = getStackTrace({stack: stacks[platform].timer2}));
          timers.setTimeout(() => actual2 = getStackTrace({stack: stacks[platform].production}));
          callback(0)();
          callback(1)();

          expect(actual1).to.equal(stacks.expected.timer);
          expect(actual2).to.equal(stacks.expected.timerParallel);
        });

      });

    });

  });

});

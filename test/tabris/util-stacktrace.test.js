import {expect, stub, restore, mockTabris} from '../test';
import ClientMock from './ClientMock';
import {addWindowTimerMethods}  from '../../src/tabris/WindowTimers';
import {create as createApp} from '../../src/tabris/App';
import {
  getStackTrace,
  patchError,
  formatError,
  getCurrentLine,
  formatPromiseRejectionReason
} from '../../src/tabris/util-stacktrace';
import PromisePolyfill from '../../src/tabris/Promise';

describe('util-stacktrace', function() {

  let client, stack;

  const stacks = {
    Android: {
      production:
`Error
  at doSomethingElse (./dist/console.js:23:2)
  at doSomething (./dist/console.js:20:5)
  at Button.start (./dist/console.js:17:17)
  at ./node_modules/tabris/tabris.min.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:74931)`,
      debug:
`Error
  at doSomethingElse (/absolute/path/dist/console.js:23:2)
  at doSomething (/absolute/path/dist/console.js:20:5)
  at Button.start (/absolute/path/dist/console.js:17:17)
  at ./node_modules/tabris/tabris.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.js:1:74931)`,
      win:
`Error
  at doSomethingElse (C:\\absolute\\path\\dist\\console.js:23:2)
  at doSomething (C:\\absolute\\path\\dist\\console.js:20:5)
  at Button.start (C:\\absolute\\path\\dist\\console.js:17:17)
  at ./node_modules/tabris/tabris.min.js:1:27243
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:27407)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:48355)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:74931)`,
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
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:77730)`,
      trace1:
`Error
  at new Promise (./node_modules/tabris/tabris.min.js:1:1896)
  at Promise (<anonymous>:1:1896)
  at Listeners.promise (./node_modules/tabris/tabris.min.js:1:31118)
  at Button.showActionSheet (./dist/actionsheet.js:15:25)
  at ./node_modules/tabris/tabris.min.js:1:30065
  at Button.trigger (./node_modules/tabris/tabris.min.js:1:30229)
  at Button.$trigger (./node_modules/tabris/tabris.min.js:1:51178)
  at Button._trigger (./node_modules/tabris/tabris.min.js:1:50948)
  at Button._trigger (./node_modules/tabris/tabris.min.js:1:59753)
  at Tabris._notify (./node_modules/tabris/tabris.min.js:1:78266)`,
      trace2:
`Error
  at actionSheet.onClose.promise.then (./dist/actionsheet.js:17:21)
  at <anonymous> (./dist/actionsheet.js:16:1)
  at tryCallOne (./node_modules/tabris/tabris.min.js:1:1588)
  at ./node_modules/tabris/tabris.min.js:1:3001
  at callback (./node_modules/tabris/tabris.min.js:1:95457)`
    },
    iOS: {
      production:
`doSomethingElse@http://192.168.6.77:8080/dist/console.js:23:2
doSomething@http://192.168.6.77:8080/dist/console.js:20:5
start@http://192.168.6.77:8080/dist/console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:74931
_notify@[native code]`,
      debug:
`doSomethingElse@/absolute/path/dist/console.js:23:2
doSomething@/absolute/path/dist/console.js:20:5
start@/absolute/path/dist/console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.js:1:74931
_notify@[native code]`,
      win:
`doSomethingElse@C:\\absolute\\path\\dist\\console.js:23:2
doSomething@C:\\absolute\\path\\dist\\console.js:20:5
start@C:\\absolute\\path\\dist\\console.js:17:17
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27243
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:27407
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:48355
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:74931
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
      trace1:
`Promise@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:1905
promise@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:31129
promise@[native code]
showActionSheet@./dist/actionsheet.js:15:25
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:30069
trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:30229
$trigger@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:51185
_notify@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:78274
_notify@[native code]`,
      trace2:
`./dist/actionsheet.js:17:21
./dist/actionsheet.js:16:1
tryCallOne@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:1589
http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:3011
callback@http://192.168.6.77:8080/node_modules/tabris/tabris.min.js:1:95462`
    },
    expected: {
      simplified:
`doSomethingElse (./dist/console.js:23:2)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)`,
      simplifiedError:
`  at doSomethingElse (./dist/console.js:23:2)
  at doSomething (./dist/console.js:20:5)
  at start (./dist/console.js:17:17)`,
      full:
`doSomethingElse (/absolute/path/dist/console.js:23:2)
doSomething (/absolute/path/dist/console.js:20:5)
start (/absolute/path/dist/console.js:17:17)
./node_modules/tabris/tabris.js:1:27243
trigger (./node_modules/tabris/tabris.js:1:27407)
$trigger (./node_modules/tabris/tabris.js:1:48355)
_notify (./node_modules/tabris/tabris.js:1:74931)`,
      mapped: `doSomethingElse (/absolute/path/console.js:26:0)
doSomething (/absolute/path/console.js:22:2)
start (/absolute/path/console.js:18:23)
./node_modules/tabris/tabris.js:1:27243
trigger (./node_modules/tabris/tabris.js:1:27407)
$trigger (./node_modules/tabris/tabris.js:1:48355)
_notify (./node_modules/tabris/tabris.js:1:74931)`,
      win:
`doSomethingElse (C:\\absolute\\path\\console.js:26:0)
doSomething (C:\\absolute\\path\\console.js:22:2)
start (C:\\absolute\\path\\console.js:18:23)`,
      timer:
`done (./dist/timer.js:19:17)
sayThanks (./dist/timer.js:16:5)
start (./dist/timer.js:10:9)`,
      timerNested:
`done (./dist/timer.js:19:17)
sayThanks (./dist/timer.js:16:5)
doSomethingElse (./dist/console.js:23:2)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
start (./dist/timer.js:10:9)`,
      timerParallel:
`doSomethingElse (./dist/console.js:23:2)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
start (./dist/timer.js:10:9)`,
      promise:
`./dist/actionsheet.js:17:21
./dist/actionsheet.js:16:1
showActionSheet (./dist/actionsheet.js:15:25)`,
      promiseNested:
`./dist/actionsheet.js:17:21
./dist/actionsheet.js:16:1
doSomethingElse (./dist/console.js:23:2)
doSomething (./dist/console.js:20:5)
start (./dist/console.js:17:17)
showActionSheet (./dist/actionsheet.js:15:25)`
    }
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
    client = new ClientMock();
    mockTabris(client);
  });

  afterEach(function() {
    global.Error = OrgError;
    restore();
  });

  ['Android', 'iOS'].forEach(function(platform) {

    describe(platform, function() {

      beforeEach(function() {
        tabris.device.platform = platform;
        tabris.app = createApp();
      });

      describe('getStackTrace', function() {

        it('prints simplified stack trace in production', function() {
          expect(getStackTrace({stack: stacks[platform].production})).to.equal(stacks.expected.simplified);
        });

        it('prints stack trace with error-style formatting', function() {
          expect(getStackTrace({stack: stacks[platform].production}, true)).to.equal(stacks.expected.simplifiedError);
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

          beforeEach(function() {
            sourceMapCopy = Object.assign({}, sourceMap);
          });

          it('prints source-mapped stack trace', function() {
            stub(tabris.Module, 'getSourceMap').withArgs('/absolute/path/dist/console.js').returns(sourceMapCopy);
            expect(getStackTrace({stack: stacks[platform].debug})).to.equal(stacks.expected.mapped);
          });

          it('prints source-mapped stack trace (windows file system)', function() {
            stub(tabris.Module, 'getSourceMap').withArgs('C:\\absolute\\path\\dist\\console.js').returns(sourceMapCopy);
            expect(getStackTrace({stack: stacks[platform].win})).to.equal(stacks.expected.win);
          });

          it('caches parsed mappings', function() {
            stub(tabris.Module, 'getSourceMap').withArgs('/absolute/path/dist/console.js').returns(sourceMapCopy);
            getStackTrace({stack: stacks[platform].debug});

            sourceMapCopy.mappings = '';

            expect(getStackTrace({stack: stacks[platform].debug})).to.equal(stacks.expected.mapped);
          });

          it('does not cache source map itself', function() {
            stub(tabris.Module, 'getSourceMap').withArgs('./dist/console.js').returns(sourceMapCopy);
            getStackTrace({stack: stacks[platform].debug});
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

          it('truncates stack traces over threshold length', function() {
            stub(tabris.Module, 'getSourceMap').withArgs('/absolute/path/dist/console.js').returns(sourceMapCopy);
            const oldStack = stacks[platform].debug.split('\n');
            const tooLong = oldStack.concat();
            const line1 = tooLong.shift();
            const line2 = tooLong.shift();
            for (let i = 0; i < 350; i++) {
              tooLong.unshift(line2);
            }
            tooLong.unshift(line1);

            const result = getStackTrace({stack: tooLong.join('\n')}).split('\n');

            const mapped = stacks.expected.mapped.split('\n');
            expect(result.length).to.equal(301);
            expect(result).to.contain('[56 more lines...]');
            expect(result[0]).to.equal(mapped[0]);
            expect(result[300]).to.equal(mapped[mapped.length - 1]);
          });

        });

        describe('across timer', function() {

          let timers;

          function callback(index) {
            return client.calls({id: tabris.app.cid, op: 'call', method: 'startTimer'})[index].parameters.callback;
          }

          beforeEach(function() {
            global.Error = (/** @type {any} */(CustomError));
            timers = {};
            addWindowTimerMethods(timers);
          });

          it('prints stack trace across timer', function() {
            stack = stacks[platform].timer1;
            let actual;

            timers.setTimeout(() => actual = getStackTrace({stack: stacks[platform].timer2}));
            callback(0)();

            expect(actual).to.equal(stacks.expected.timer);
          });

          it('prints stack trace across nested timers', function() {
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

        describe('with Promises', function() {

          beforeEach(function() {
            global.Error = (/** @type {any} */(CustomError));
          });

          it('prints stack trace across one Promise', function() {
            stack = stacks[platform].trace1;
            return new PromisePolyfill(resolve => resolve()).then(() => {
              expect(getStackTrace({stack: stacks[platform].trace2})).to.equal(stacks.expected.promise);
            });
          });

          it('prints stack trace across chained Promises', function() {
            stack = stacks[platform].trace1;
            return new PromisePolyfill(resolve => resolve()).then(() => true).then(() => {
              expect(getStackTrace({stack: stacks[platform].trace2})).to.equal(stacks.expected.promise);
            });
          });

          it('prints stack trace across nested Promises', function() {
            stack = stacks[platform].trace1;
            return new PromisePolyfill(resolve => resolve()).then(() => {
              stack = stacks[platform].production;
              return new PromisePolyfill(resolve => resolve()).then(() => {
                expect(getStackTrace({stack: stacks[platform].trace2})).to.equal(stacks.expected.promiseNested);
              });
            });
          });

        });

      });

      describe('formatError', function() {

        it('uses processed stack trace', function() {
          stack = stacks[platform].production;
          const error = new CustomError('Foo');

          expect(formatError(error)).to.equal('CustomError: Foo\n' + stacks.expected.simplifiedError);
        });

        it('returns string as-is', function() {
          expect(formatError('foo')).to.equal('foo');
        });

        it('returns null as string', function() {
          expect(formatError(null)).to.equal('null');
        });

        it('returns undefined as string', function() {
          expect(formatError('undefined')).to.equal('undefined');
        });

        it('returns object stringified', function() {
          expect(formatError({toString() { return 'foo'; }})).to.equal('Object: foo');
        });

      });

      describe('getCurrentLine', function() {

        it('gives first line of processed stack trace', function() {
          stack = stacks[platform].production;
          const error = new CustomError('Foo');

          expect(getCurrentLine(error)).to.equal('doSomethingElse (./dist/console.js:23:2)');
        });

      });

      describe('patchError', function() {

        it('patches given error', function() {
          patchError(CustomError);
          stack = stacks[platform].production;
          const error = new CustomError('Foo');

          expect(error.toString()).to.equal('CustomError: Foo\n' + stacks.expected.simplifiedError);
        });

      });

      describe('formatPromiseRejectionReason', function() {

        it('returns stack trace for undefined', function() {
          const result = formatPromiseRejectionReason();

          expect(result).to.match(/^\n {2}at .*util-stacktrace.js/);
        });

        it('returns stack trace and reason for null', function() {
          const result = formatPromiseRejectionReason(null);

          expect(result).to.match(/^null\n {2}at .*util-stacktrace.js/);
        });

        it('returns stack trace and reason for string', function() {
          const result = formatPromiseRejectionReason('foo');

          expect(result).to.match(/^foo\n {2}at .*util-stacktrace.js/);
        });

        it('returns stack trace and reason for stringifiables', function() {
          const stringifiable = {toString: () => 'foo'};
          const result = formatPromiseRejectionReason(stringifiable);

          expect(result).to.match(/^foo\n {2}at .*util-stacktrace.js/);
        });

        it('does not include stack if object has one', function() {
          const stringifiable = {toString: () => 'foo', stack: 'bar'};
          const result = formatPromiseRejectionReason(stringifiable);

          expect(result).to.match(/^foo$/);
        });

      });

    });

  });

});
